#!/usr/bin/env python3
"""
Backend API Test Suite for Beyond Marketing Platform
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import time
from uuid import uuid4

# Base URL from .env
BASE_URL = "https://agency-os-37.preview.emergentagent.com/api"

# Test data
test_email = f"test-{uuid4()}@beyondmarketing.com"
test_password = "SecurePass123!"
test_name = "Sarah Johnson"
test_company = "TechFlow Solutions"
auth_token = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_success(msg):
    print(f"✅ SUCCESS: {msg}")

def print_error(msg):
    print(f"❌ ERROR: {msg}")

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

# ============================================================================
# TEST 1: Health Check
# ============================================================================
def test_health_check():
    print_test("Health Check GET /api/health")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') == True and 'service' in data and 'ts' in data:
                print_success("Health check passed with correct structure")
                return True
            else:
                print_error(f"Health check returned unexpected structure: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False

# ============================================================================
# TEST 2: Auth - Register New User
# ============================================================================
def test_auth_register():
    print_test("Auth Register POST /api/auth/register")
    global auth_token
    try:
        payload = {
            "name": test_name,
            "email": test_email,
            "password": test_password,
            "company": test_company
        }
        print_info(f"Registering user: {test_email}")
        
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                auth_token = data['token']
                user = data['user']
                if user.get('email') == test_email.lower() and user.get('name') == test_name:
                    print_success(f"User registered successfully with token")
                    return True
                else:
                    print_error(f"User data mismatch: {user}")
                    return False
            else:
                print_error(f"Missing token or user in response: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Register failed: {str(e)}")
        return False

# ============================================================================
# TEST 3: Auth - Register Duplicate Email (409)
# ============================================================================
def test_auth_register_duplicate():
    print_test("Auth Register Duplicate Email (expect 409)")
    try:
        payload = {
            "name": "Another User",
            "email": test_email,
            "password": "AnotherPass123!",
            "company": "Another Company"
        }
        print_info(f"Attempting to register duplicate email: {test_email}")
        
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 409:
            data = response.json()
            if 'error' in data and 'already registered' in data['error'].lower():
                print_success("Duplicate email correctly rejected with 409")
                return True
            else:
                print_error(f"Expected 'Email already registered' error, got: {data}")
                return False
        else:
            print_error(f"Expected 409, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Duplicate register test failed: {str(e)}")
        return False

# ============================================================================
# TEST 4: Auth - Login with Correct Credentials
# ============================================================================
def test_auth_login_success():
    print_test("Auth Login POST /api/auth/login (correct credentials)")
    global auth_token
    try:
        payload = {
            "email": test_email,
            "password": test_password
        }
        print_info(f"Logging in with: {test_email}")
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                auth_token = data['token']
                user = data['user']
                if user.get('email') == test_email.lower():
                    print_success("Login successful with correct credentials")
                    return True
                else:
                    print_error(f"User email mismatch: {user}")
                    return False
            else:
                print_error(f"Missing token or user in response: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Login failed: {str(e)}")
        return False

# ============================================================================
# TEST 5: Auth - Login with Wrong Password (401)
# ============================================================================
def test_auth_login_wrong_password():
    print_test("Auth Login with Wrong Password (expect 401)")
    try:
        payload = {
            "email": test_email,
            "password": "WrongPassword123!"
        }
        print_info(f"Attempting login with wrong password")
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 401:
            data = response.json()
            if 'error' in data:
                print_success("Wrong password correctly rejected with 401")
                return True
            else:
                print_error(f"Expected error message, got: {data}")
                return False
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Wrong password test failed: {str(e)}")
        return False

# ============================================================================
# TEST 6: Auth - Get Current User with Token
# ============================================================================
def test_auth_me_with_token():
    print_test("Auth Me GET /api/auth/me (with Bearer token)")
    try:
        if not auth_token:
            print_error("No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        print_info(f"Getting current user with token")
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers=headers,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'user' in data:
                user = data['user']
                if user.get('email') == test_email.lower() and user.get('name') == test_name:
                    print_success("Auth me returned correct user data")
                    return True
                else:
                    print_error(f"User data mismatch: {user}")
                    return False
            else:
                print_error(f"Missing user in response: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Auth me test failed: {str(e)}")
        return False

# ============================================================================
# TEST 7: Auth - Get Current User without Token (401)
# ============================================================================
def test_auth_me_without_token():
    print_test("Auth Me GET /api/auth/me (without token, expect 401)")
    try:
        print_info(f"Attempting to get user without token")
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 401:
            data = response.json()
            if 'error' in data:
                print_success("No token correctly rejected with 401")
                return True
            else:
                print_error(f"Expected error message, got: {data}")
                return False
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"No token test failed: {str(e)}")
        return False

# ============================================================================
# TEST 8: AI Marketing Audit - Success Path
# ============================================================================
def test_audit_success():
    print_test("AI Marketing Audit POST /api/audit (GPT-5 integration)")
    try:
        payload = {
            "name": "Michael Chen",
            "email": f"michael-{uuid4()}@techstartup.io",
            "website": "techstartup.io",
            "industry": "SaaS Technology",
            "goals": "Increase organic traffic by 200% and generate 500 qualified leads per month",
            "currentChallenges": "Low domain authority, limited content strategy, no clear SEO roadmap"
        }
        print_info(f"Requesting audit for: {payload['website']}")
        print_info(f"⏱️  This may take up to 90 seconds (GPT-5 call)...")
        
        response = requests.post(
            f"{BASE_URL}/audit",
            json=payload,
            timeout=120  # 120 second timeout for LLM call
        )
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response keys: {list(data.keys())}")
            
            # Check for id and audit
            if 'id' not in data or 'audit' not in data:
                print_error(f"Missing id or audit in response: {data}")
                return False
            
            audit = data['audit']
            print_info(f"Audit keys: {list(audit.keys())}")
            
            # Validate audit structure
            required_fields = [
                'healthScore', 'positioning', 'topInsights',
                'plan', 'build', 'grow',
                'connectedSystems', 'quickWins', 'estimatedImpact'
            ]
            
            missing_fields = [f for f in required_fields if f not in audit]
            if missing_fields:
                print_error(f"Missing required fields in audit: {missing_fields}")
                return False
            
            # Validate healthScore is 0-100
            health_score = audit.get('healthScore')
            if not isinstance(health_score, (int, float)) or health_score < 0 or health_score > 100:
                print_error(f"Invalid healthScore: {health_score} (must be 0-100)")
                return False
            
            # Validate plan/build/grow structure
            for phase in ['plan', 'build', 'grow']:
                phase_data = audit.get(phase)
                if not isinstance(phase_data, dict):
                    print_error(f"{phase} is not an object: {phase_data}")
                    return False
                if 'summary' not in phase_data or 'actions' not in phase_data:
                    print_error(f"{phase} missing summary or actions: {phase_data}")
                    return False
                if not isinstance(phase_data['actions'], list):
                    print_error(f"{phase} actions is not an array: {phase_data['actions']}")
                    return False
            
            # Validate arrays
            for field in ['topInsights', 'connectedSystems', 'quickWins']:
                if not isinstance(audit.get(field), list):
                    print_error(f"{field} is not an array: {audit.get(field)}")
                    return False
            
            # Validate strings
            for field in ['positioning', 'estimatedImpact']:
                if not isinstance(audit.get(field), str):
                    print_error(f"{field} is not a string: {audit.get(field)}")
                    return False
            
            print_success(f"Audit generated successfully with healthScore: {health_score}")
            print_info(f"Positioning: {audit['positioning'][:100]}...")
            print_info(f"Top Insights: {len(audit['topInsights'])} insights")
            print_info(f"Plan actions: {len(audit['plan']['actions'])} actions")
            print_info(f"Build actions: {len(audit['build']['actions'])} actions")
            print_info(f"Grow actions: {len(audit['grow']['actions'])} actions")
            
            # Store audit ID for next test
            global audit_id
            audit_id = data['id']
            return True
        else:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print_error("Request timed out after 120 seconds")
        return False
    except Exception as e:
        print_error(f"Audit test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# TEST 9: Get Audit by ID
# ============================================================================
def test_get_audit_by_id():
    print_test("Get Audit GET /api/audit/:id")
    try:
        if 'audit_id' not in globals():
            print_error("No audit ID available from previous test")
            return False
        
        print_info(f"Fetching audit: {audit_id}")
        
        response = requests.get(
            f"{BASE_URL}/audit/{audit_id}",
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'audit' in data and data['id'] == audit_id:
                print_success("Audit retrieved successfully by ID")
                return True
            else:
                print_error(f"Audit data mismatch: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Get audit by ID failed: {str(e)}")
        return False

# ============================================================================
# TEST 10: Audit with Missing Website (400)
# ============================================================================
def test_audit_missing_website():
    print_test("AI Marketing Audit without website (expect 400)")
    try:
        payload = {
            "name": "Test User",
            "email": f"test-{uuid4()}@example.com",
            "industry": "Technology",
            "goals": "Grow business",
            "currentChallenges": "Need more leads"
        }
        print_info(f"Attempting audit without website field")
        
        response = requests.post(
            f"{BASE_URL}/audit",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                print_success("Missing website correctly rejected with 400")
                return True
            else:
                print_error(f"Expected error message, got: {data}")
                return False
        else:
            print_error(f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Missing website test failed: {str(e)}")
        return False

# ============================================================================
# TEST 11: Portal Dashboard without Token (401)
# ============================================================================
def test_portal_dashboard_without_token():
    print_test("Portal Dashboard GET /api/portal/dashboard (without token, expect 401)")
    try:
        print_info(f"Attempting to access dashboard without token")
        
        response = requests.get(
            f"{BASE_URL}/portal/dashboard",
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 401:
            data = response.json()
            if 'error' in data:
                print_success("Dashboard access without token correctly rejected with 401")
                return True
            else:
                print_error(f"Expected error message, got: {data}")
                return False
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Dashboard without token test failed: {str(e)}")
        return False

# ============================================================================
# TEST 12: Portal Dashboard with Valid Token
# ============================================================================
def test_portal_dashboard_with_token():
    print_test("Portal Dashboard GET /api/portal/dashboard (with Bearer token)")
    try:
        if not auth_token:
            print_error("No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        print_info(f"Accessing dashboard with valid token")
        
        response = requests.get(
            f"{BASE_URL}/portal/dashboard",
            headers=headers,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response keys: {list(data.keys())}")
            
            # Validate structure
            required_fields = [
                'user', 'healthScore', 'kpis', 'traffic',
                'rankings', 'projects', 'tasks', 'notifications'
            ]
            
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                print_error(f"Missing required fields: {missing_fields}")
                return False
            
            # Validate healthScore
            if not isinstance(data['healthScore'], (int, float)):
                print_error(f"Invalid healthScore type: {type(data['healthScore'])}")
                return False
            
            # Validate KPIs structure
            kpis = data['kpis']
            required_kpis = ['organicTraffic', 'leads', 'conversions', 'revenueAttributed']
            for kpi in required_kpis:
                if kpi not in kpis:
                    print_error(f"Missing KPI: {kpi}")
                    return False
                if 'value' not in kpis[kpi] or 'delta' not in kpis[kpi]:
                    print_error(f"KPI {kpi} missing value or delta: {kpis[kpi]}")
                    return False
            
            # Validate traffic array (should have 12 months)
            traffic = data['traffic']
            if not isinstance(traffic, list) or len(traffic) != 12:
                print_error(f"Traffic should be array of 12 items, got: {len(traffic)}")
                return False
            
            # Validate traffic items have required fields
            for item in traffic:
                if 'month' not in item or 'organic' not in item or 'paid' not in item or 'direct' not in item:
                    print_error(f"Traffic item missing required fields: {item}")
                    return False
            
            # Validate arrays
            if not isinstance(data['rankings'], list):
                print_error(f"Rankings should be array")
                return False
            if not isinstance(data['projects'], list):
                print_error(f"Projects should be array")
                return False
            if not isinstance(data['tasks'], list):
                print_error(f"Tasks should be array")
                return False
            if not isinstance(data['notifications'], list):
                print_error(f"Notifications should be array")
                return False
            
            print_success(f"Dashboard data retrieved successfully")
            print_info(f"Health Score: {data['healthScore']}")
            print_info(f"Organic Traffic: {kpis['organicTraffic']['value']} ({kpis['organicTraffic']['delta']})")
            print_info(f"Traffic data points: {len(traffic)}")
            print_info(f"Rankings: {len(data['rankings'])} keywords")
            print_info(f"Projects: {len(data['projects'])} active")
            print_info(f"Tasks: {len(data['tasks'])} pending")
            print_info(f"Notifications: {len(data['notifications'])} unread")
            return True
        else:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Dashboard test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# TEST 13: Contact Form Submission
# ============================================================================
def test_contact_form():
    print_test("Contact Form POST /api/contact")
    try:
        payload = {
            "name": "Jennifer Martinez",
            "email": f"jennifer-{uuid4()}@growthcompany.com",
            "company": "Growth Company Inc",
            "message": "We're interested in your Plan → Build → Grow framework and would like to schedule a discovery call to discuss our marketing challenges."
        }
        print_info(f"Submitting contact form for: {payload['name']}")
        
        response = requests.post(
            f"{BASE_URL}/contact",
            json=payload,
            timeout=10
        )
        print_info(f"Status: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') == True and 'id' in data:
                print_success(f"Contact form submitted successfully with ID: {data['id']}")
                return True
            else:
                print_error(f"Unexpected response structure: {data}")
                return False
        else:
            print_error(f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Contact form test failed: {str(e)}")
        return False

# ============================================================================
# RUN ALL TESTS
# ============================================================================
def run_all_tests():
    print("\n" + "="*80)
    print("BEYOND MARKETING BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Email: {test_email}")
    print("="*80)
    
    results = {}
    
    # Test 1: Health Check
    results['Health Check'] = test_health_check()
    
    # Test 2-7: Auth Flow
    results['Auth Register'] = test_auth_register()
    results['Auth Register Duplicate'] = test_auth_register_duplicate()
    results['Auth Login Success'] = test_auth_login_success()
    results['Auth Login Wrong Password'] = test_auth_login_wrong_password()
    results['Auth Me With Token'] = test_auth_me_with_token()
    results['Auth Me Without Token'] = test_auth_me_without_token()
    
    # Test 8-10: AI Marketing Audit
    results['Audit Success'] = test_audit_success()
    results['Get Audit By ID'] = test_get_audit_by_id()
    results['Audit Missing Website'] = test_audit_missing_website()
    
    # Test 11-12: Portal Dashboard
    results['Dashboard Without Token'] = test_portal_dashboard_without_token()
    results['Dashboard With Token'] = test_portal_dashboard_with_token()
    
    # Test 13: Contact Form
    results['Contact Form'] = test_contact_form()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
