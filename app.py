#!/usr/bin/env python3
"""
Business Finance Manager - Schedule C Tax Tracking
Flask Backend Application with Complete CRUD Operations
Fixed Date Handling to Prevent Timezone Issues
"""

from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime, date
import webbrowser
import threading
import time

app = Flask(__name__)

# Database setup
DATABASE = 'business_finance.db'

def parse_date_safely(date_str):
    """Parse date string to date object to avoid timezone issues"""
    if not date_str:
        return None
    
    # Handle HTML date input format (YYYY-MM-DD)
    try:
        # Parse as date object directly to avoid timezone conversion
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        return parsed_date
    except ValueError:
        try:
            # Try MM/DD/YYYY format as fallback
            parsed_date = datetime.strptime(date_str, '%m/%d/%Y').date()
            return parsed_date
        except ValueError:
            return None

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Income table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client TEXT NOT NULL,
            service_type TEXT NOT NULL,
            amount REAL NOT NULL,
            date DATE NOT NULL,
            expects_1099 BOOLEAN NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Expenses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            date DATE NOT NULL,
            business_purpose TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Mileage table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mileage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_location TEXT NOT NULL,
            destination TEXT NOT NULL,
            miles REAL NOT NULL,
            business_purpose TEXT NOT NULL,
            date DATE NOT NULL,
            deduction_amount REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Home office table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS home_office (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT NOT NULL,
            square_feet INTEGER,
            home_square_feet INTEGER,
            business_percentage REAL,
            annual_deduction REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Utilities table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS utilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utility_type TEXT NOT NULL,
            monthly_amount REAL NOT NULL,
            business_percentage REAL NOT NULL,
            monthly_deduction REAL NOT NULL,
            annual_deduction REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tax payments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tax_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quarter TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_date DATE NOT NULL,
            payment_method TEXT,
            confirmation_number TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tax settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tax_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT,
            tax_year INTEGER,
            filing_status TEXT,
            other_income REAL DEFAULT 0,
            prior_year_tax REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Savings goals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            target_date DATE,
            goal_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Financial calculation functions
def calculate_self_employment_tax(net_profit):
    """Calculate self-employment tax (15.3% on 92.35% of net profit)"""
    if net_profit <= 0:
        return 0
    se_income = net_profit * 0.9235
    return round(se_income * 0.153, 2)

def get_quarterly_due_dates(tax_year):
    """Get quarterly tax due dates for a given tax year"""
    return [
        f"{tax_year}-04-15",  # Q1
        f"{tax_year}-06-15",  # Q2  
        f"{tax_year}-09-15",  # Q3
        f"{tax_year + 1}-01-15"  # Q4
    ]

def get_tax_reminders():
    """Get tax payment reminders (30 days before due)"""
    today = date.today()
    current_year = today.year
    
    # Get current tax year due dates
    due_dates = get_quarterly_due_dates(current_year)
    
    reminders = []
    for i, due_date in enumerate(due_dates, 1):
        due = datetime.strptime(due_date, "%Y-%m-%d").date()
        days_until_due = (due - today).days
        
        status = "future"
        if days_until_due < 0:
            status = "overdue"
        elif days_until_due <= 30:
            status = "due_soon"
        
        reminders.append({
            'quarter': f'Q{i}',
            'due_date': due_date,
            'days_until_due': days_until_due,
            'status': status
        })
    
    return reminders

# Routes
@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/api/overview')
def api_overview():
    """API endpoint for overview data"""
    try:
        conn = get_db_connection()
        
        # Get totals
        income_result = conn.execute('SELECT SUM(amount) as total FROM income').fetchone()
        expenses_result = conn.execute('SELECT SUM(amount) as total FROM expenses').fetchone()
        mileage_result = conn.execute('SELECT SUM(deduction_amount) as total FROM mileage').fetchone()
        
        total_income = income_result['total'] or 0
        total_expenses = expenses_result['total'] or 0
        mileage_deductions = mileage_result['total'] or 0
        
        # Calculate home office deduction
        home_office = conn.execute('SELECT annual_deduction FROM home_office ORDER BY created_at DESC LIMIT 1').fetchone()
        home_office_deduction = home_office['annual_deduction'] if home_office else 0
        
        # Calculate utility deductions
        utilities_result = conn.execute('SELECT SUM(annual_deduction) as total FROM utilities').fetchone()
        utility_deductions = utilities_result['total'] or 0
        
        # Calculate net profit
        total_deductions = total_expenses + mileage_deductions + home_office_deduction + utility_deductions
        net_profit = total_income - total_deductions
        
        # Calculate taxes
        se_tax = calculate_self_employment_tax(net_profit)
        
        # Get tax settings for income tax calculation
        tax_settings = conn.execute('SELECT * FROM tax_settings ORDER BY updated_at DESC LIMIT 1').fetchone()
        
        income_tax = 0
        if tax_settings and net_profit > 0:
            # Simplified income tax calculation (22% bracket assumption)
            total_income_for_tax = net_profit + (tax_settings['other_income'] or 0)
            income_tax = round(total_income_for_tax * 0.22, 2)
        
        total_tax = se_tax + income_tax
        
        # Get recent transactions
        recent_income = conn.execute(
            'SELECT client, amount, date, "income" as type FROM income ORDER BY date DESC LIMIT 5'
        ).fetchall()
        
        recent_expenses = conn.execute(
            'SELECT description, amount, date, "expense" as type FROM expenses ORDER BY date DESC LIMIT 5'
        ).fetchall()
        
        # Combine and sort recent transactions
        all_recent = []
        for row in recent_income:
            all_recent.append(dict(row))
        for row in recent_expenses:
            all_recent.append(dict(row))
        
        all_recent.sort(key=lambda x: x['date'], reverse=True)
        recent_transactions = all_recent[:10]
        
        # Get tax reminders
        tax_reminders = get_tax_reminders()
        
        conn.close()
        
        return jsonify({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'mileage_deductions': float(mileage_deductions),
            'home_office_deduction': float(home_office_deduction),
            'utility_deductions': float(utility_deductions),
            'net_profit': float(net_profit),
            'self_employment_tax': float(se_tax),
            'income_tax': float(income_tax),
            'total_tax': float(total_tax),
            'recent_transactions': recent_transactions,
            'tax_reminders': tax_reminders
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== INCOME ENDPOINTS =====
@app.route('/api/income', methods=['GET', 'POST'])
def api_income():
    """Handle income operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            income_date = parse_date_safely(data['date'])
            if not income_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                INSERT INTO income (client, service_type, amount, date, expects_1099, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['client'],
                data['service_type'],
                data['amount'],
                income_date,
                data['expects_1099'],
                data.get('notes', '')
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            income_records = conn.execute(
                'SELECT * FROM income ORDER BY date DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in income_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/income/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_income_modify(record_id):
    """Handle income view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM income WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            income_date = parse_date_safely(data['date'])
            if not income_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                UPDATE income 
                SET client = ?, service_type = ?, amount = ?, date = ?, expects_1099 = ?, notes = ?
                WHERE id = ?
            ''', (
                data['client'],
                data['service_type'],
                data['amount'],
                income_date,
                data['expects_1099'],
                data.get('notes', ''),
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM income WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== EXPENSE ENDPOINTS =====
@app.route('/api/expenses', methods=['GET', 'POST'])
def api_expenses():
    """Handle expense operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            expense_date = parse_date_safely(data['date'])
            if not expense_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                INSERT INTO expenses (category, description, amount, date, business_purpose)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['category'],
                data['description'],
                data['amount'],
                expense_date,
                data['business_purpose']
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            expense_records = conn.execute(
                'SELECT * FROM expenses ORDER BY date DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in expense_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_expenses_modify(record_id):
    """Handle expense view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM expenses WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            expense_date = parse_date_safely(data['date'])
            if not expense_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                UPDATE expenses 
                SET category = ?, description = ?, amount = ?, date = ?, business_purpose = ?
                WHERE id = ?
            ''', (
                data['category'],
                data['description'],
                data['amount'],
                expense_date,
                data['business_purpose'],
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM expenses WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== MILEAGE ENDPOINTS =====
@app.route('/api/mileage', methods=['GET', 'POST'])
def api_mileage():
    """Handle mileage operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            mileage_date = parse_date_safely(data['date'])
            if not mileage_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            # Calculate deduction (2024 IRS rate: $0.67 per mile)
            miles = float(data['miles'])
            deduction = round(miles * 0.67, 2)
            
            conn.execute('''
                INSERT INTO mileage (start_location, destination, miles, business_purpose, date, deduction_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['start_location'],
                data['destination'],
                data['miles'],
                data['business_purpose'],
                mileage_date,
                deduction
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            mileage_records = conn.execute(
                'SELECT * FROM mileage ORDER BY date DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in mileage_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mileage/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_mileage_modify(record_id):
    """Handle mileage view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM mileage WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            mileage_date = parse_date_safely(data['date'])
            if not mileage_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            # Recalculate deduction with updated miles
            miles = float(data['miles'])
            deduction = round(miles * 0.67, 2)
            
            conn.execute('''
                UPDATE mileage 
                SET start_location = ?, destination = ?, miles = ?, business_purpose = ?, date = ?, deduction_amount = ?
                WHERE id = ?
            ''', (
                data['start_location'],
                data['destination'],
                data['miles'],
                data['business_purpose'],
                mileage_date,
                deduction,
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM mileage WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== UTILITY ENDPOINTS =====
@app.route('/api/utilities', methods=['GET', 'POST'])
def api_utilities():
    """Handle utility expenses"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            monthly_amount = float(data['monthly_amount'])
            business_percentage = float(data['business_percentage'])
            monthly_deduction = round(monthly_amount * (business_percentage / 100), 2)
            annual_deduction = monthly_deduction * 12
            
            conn.execute('''
                INSERT INTO utilities (utility_type, monthly_amount, business_percentage, monthly_deduction, annual_deduction)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['utility_type'],
                monthly_amount,
                business_percentage,
                monthly_deduction,
                annual_deduction
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            utility_records = conn.execute(
                'SELECT * FROM utilities ORDER BY created_at DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in utility_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/utilities/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_utilities_modify(record_id):
    """Handle utility view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM utilities WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            monthly_amount = float(data['monthly_amount'])
            business_percentage = float(data['business_percentage'])
            monthly_deduction = round(monthly_amount * (business_percentage / 100), 2)
            annual_deduction = monthly_deduction * 12
            
            conn.execute('''
                UPDATE utilities 
                SET utility_type = ?, monthly_amount = ?, business_percentage = ?, 
                    monthly_deduction = ?, annual_deduction = ?
                WHERE id = ?
            ''', (
                data['utility_type'],
                monthly_amount,
                business_percentage,
                monthly_deduction,
                annual_deduction,
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM utilities WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== HOME OFFICE ENDPOINTS =====
@app.route('/api/home-office', methods=['GET', 'POST'])
def api_home_office():
    """Handle home office deduction"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Clear existing home office setup
            conn.execute('DELETE FROM home_office')
            
            if data['method'] == 'simplified':
                square_feet = int(data['square_feet'])
                annual_deduction = min(square_feet * 5, 1500)  # $5 per sq ft, max $1500
                
                conn.execute('''
                    INSERT INTO home_office (method, square_feet, annual_deduction)
                    VALUES (?, ?, ?)
                ''', ('simplified', square_feet, annual_deduction))
            
            else:  # actual method
                home_sq_ft = int(data['home_square_feet'])
                office_sq_ft = int(data['office_square_feet'])
                business_percentage = round((office_sq_ft / home_sq_ft) * 100, 2)
                
                conn.execute('''
                    INSERT INTO home_office (method, square_feet, home_square_feet, business_percentage, annual_deduction)
                    VALUES (?, ?, ?, ?, ?)
                ''', ('actual', office_sq_ft, home_sq_ft, business_percentage, 0))
            
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            home_office = conn.execute(
                'SELECT * FROM home_office ORDER BY created_at DESC LIMIT 1'
            ).fetchone()
            
            conn.close()
            
            if home_office:
                return jsonify(dict(home_office))
            else:
                return jsonify({})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== TAX SETTINGS ENDPOINTS =====
@app.route('/api/tax-settings', methods=['GET', 'POST'])
def api_tax_settings():
    """Handle tax settings"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Clear existing settings
            conn.execute('DELETE FROM tax_settings')
            
            conn.execute('''
                INSERT INTO tax_settings (business_name, tax_year, filing_status, other_income, prior_year_tax)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['business_name'],
                data['tax_year'],
                data['filing_status'],
                data.get('other_income', 0),
                data.get('prior_year_tax', 0)
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            tax_settings = conn.execute(
                'SELECT * FROM tax_settings ORDER BY updated_at DESC LIMIT 1'
            ).fetchone()
            
            conn.close()
            
            if tax_settings:
                return jsonify(dict(tax_settings))
            else:
                return jsonify({})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== TAX PAYMENT ENDPOINTS =====
@app.route('/api/tax-payments', methods=['GET', 'POST'])
def api_tax_payments():
    """Handle tax payments"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            payment_date = parse_date_safely(data['payment_date'])
            if not payment_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                INSERT INTO tax_payments (quarter, amount, payment_date, payment_method, confirmation_number)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['quarter'],
                data['amount'],
                payment_date,
                data.get('payment_method', ''),
                data.get('confirmation_number', '')
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            payment_records = conn.execute(
                'SELECT * FROM tax_payments ORDER BY payment_date DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in payment_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tax-payments/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_tax_payments_modify(record_id):
    """Handle tax payment view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM tax_payments WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            # Parse date safely to avoid timezone issues
            payment_date = parse_date_safely(data['payment_date'])
            if not payment_date:
                return jsonify({'error': 'Invalid date format'}), 400
            
            conn.execute('''
                UPDATE tax_payments 
                SET quarter = ?, amount = ?, payment_date = ?, payment_method = ?, confirmation_number = ?
                WHERE id = ?
            ''', (
                data['quarter'],
                data['amount'],
                payment_date,
                data.get('payment_method', ''),
                data.get('confirmation_number', ''),
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM tax_payments WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== SAVINGS GOALS ENDPOINTS =====
@app.route('/api/savings-goals', methods=['GET', 'POST'])
def api_savings_goals():
    """Handle savings goals"""
    try:
        conn = get_db_connection()
        
        if request.method == 'POST':
            data = request.json
            
            # Parse target date safely (optional field)
            target_date = None
            if data.get('target_date'):
                target_date = parse_date_safely(data['target_date'])
                if not target_date:
                    return jsonify({'error': 'Invalid target date format'}), 400
            
            conn.execute('''
                INSERT INTO savings_goals (goal_name, target_amount, current_amount, target_date, goal_type)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['goal_name'],
                data['target_amount'],
                data.get('current_amount', 0),
                target_date,
                data.get('goal_type', 'general')
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        else:
            goal_records = conn.execute(
                'SELECT * FROM savings_goals ORDER BY created_at DESC'
            ).fetchall()
            
            conn.close()
            
            return jsonify([dict(row) for row in goal_records])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/savings-goals/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def api_savings_goals_modify(record_id):
    """Handle savings goal view/edit/delete operations"""
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            record = conn.execute(
                'SELECT * FROM savings_goals WHERE id = ?', (record_id,)
            ).fetchone()
            conn.close()
            
            if record:
                return jsonify(dict(record))
            else:
                return jsonify({'error': 'Record not found'}), 404
        
        elif request.method == 'PUT':
            data = request.json
            
            # Parse target date safely (optional field)
            target_date = None
            if data.get('target_date'):
                target_date = parse_date_safely(data['target_date'])
                if not target_date:
                    return jsonify({'error': 'Invalid target date format'}), 400
            
            conn.execute('''
                UPDATE savings_goals 
                SET goal_name = ?, target_amount = ?, current_amount = ?, target_date = ?, goal_type = ?
                WHERE id = ?
            ''', (
                data['goal_name'],
                data['target_amount'],
                data.get('current_amount', 0),
                target_date,
                data.get('goal_type', 'general'),
                record_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
        
        elif request.method == 'DELETE':
            conn.execute('DELETE FROM savings_goals WHERE id = ?', (record_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def open_browser():
    """Open browser after a short delay"""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("=" * 60)
    print("🏢 BUSINESS FINANCE MANAGER")
    print("=" * 60)
    print("✅ Initializing database...")
    print("✅ Starting Flask server...")
    print("🌐 Opening browser at: http://localhost:5000")
    print("❌ Press Ctrl+C to stop the application")
    print("=" * 60)
    
    # Start browser in separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    try:
        # Run Flask app
        app.run(host='localhost', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Business Finance Manager...")
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        input("Press Enter to exit...")