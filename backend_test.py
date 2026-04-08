import requests
import sys
import json
from datetime import datetime

class CricketAuctionAPITester:
    def __init__(self, base_url="https://cricket-purse-pro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.config_id = None
        self.team_ids = []
        self.player_ids = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f", Error: {error_data.get('detail', response.text)}"
                    except:
                        details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_1_config_operations(self):
        """Test auction configuration"""
        print("\n🔧 Testing Configuration Operations...")
        
        # Test get default config
        success, config = self.run_test(
            "Get Default Config",
            "GET", "config", 200
        )
        
        # Test create/update config
        config_data = {
            "num_teams": 8,
            "purse_amount": 100.0,
            "slots_per_team": 25
        }
        success, response = self.run_test(
            "Create/Update Config",
            "POST", "config", 200,
            data=config_data
        )
        
        if success:
            self.config_id = response.get('id')
        
        # Test config validation - invalid teams
        invalid_config = {
            "num_teams": 25,  # > 20
            "purse_amount": 100.0,
            "slots_per_team": 25
        }
        self.run_test(
            "Config Validation - Invalid Teams",
            "POST", "config", 422,
            data=invalid_config
        )

    def test_2_team_operations(self):
        """Test team registration"""
        print("\n👥 Testing Team Operations...")
        
        # Test get teams (should be empty initially)
        self.run_test("Get Teams (Empty)", "GET", "teams", 200)
        
        # Test create teams
        teams_data = [
            {"name": "Mumbai Indians", "logo_url": "https://example.com/mi.png"},
            {"name": "Chennai Super Kings", "logo_url": "https://example.com/csk.png"},
            {"name": "Royal Challengers Bangalore", "logo_url": ""},
            {"name": "Delhi Capitals"}
        ]
        
        for i, team_data in enumerate(teams_data):
            success, response = self.run_test(
                f"Create Team {i+1} - {team_data['name']}",
                "POST", "teams", 200,
                data=team_data
            )
            if success:
                self.team_ids.append(response.get('id'))
        
        # Test duplicate team name
        self.run_test(
            "Create Duplicate Team",
            "POST", "teams", 400,
            data={"name": "Mumbai Indians"}
        )
        
        # Test get specific team
        if self.team_ids:
            self.run_test(
                "Get Specific Team",
                "GET", f"teams/{self.team_ids[0]}", 200
            )
        
        # Test update team
        if self.team_ids:
            self.run_test(
                "Update Team",
                "PUT", f"teams/{self.team_ids[0]}", 200,
                data={"name": "Mumbai Indians Updated"}
            )

    def test_3_player_operations(self):
        """Test player management"""
        print("\n🏏 Testing Player Operations...")
        
        # Test get players (should be empty initially)
        self.run_test("Get Players (Empty)", "GET", "players", 200)
        
        # Test create players
        players_data = [
            {"name": "Virat Kohli", "role": "Batsman", "base_price": 150.0},
            {"name": "Jasprit Bumrah", "role": "Bowler", "base_price": 120.0},
            {"name": "Hardik Pandya", "role": "All-rounder", "base_price": 100.0},
            {"name": "MS Dhoni", "role": "Wicketkeeper", "base_price": 80.0},
            {"name": "Rohit Sharma", "role": "Batsman", "base_price": 140.0}
        ]
        
        for i, player_data in enumerate(players_data):
            success, response = self.run_test(
                f"Create Player {i+1} - {player_data['name']}",
                "POST", "players", 200,
                data=player_data
            )
            if success:
                self.player_ids.append(response.get('id'))
        
        # Test invalid role
        self.run_test(
            "Create Player - Invalid Role",
            "POST", "players", 400,
            data={"name": "Test Player", "role": "InvalidRole", "base_price": 50.0}
        )
        
        # Test get players with filters
        self.run_test("Get Players - Filter by Role", "GET", "players?role=Batsman", 200)
        self.run_test("Get Players - Filter by Status", "GET", "players?status=pending", 200)

    def test_4_selling_operations(self):
        """Test player selling with validations"""
        print("\n💰 Testing Selling Operations...")
        
        if not self.player_ids or not self.team_ids:
            print("❌ Cannot test selling - no players or teams available")
            return
        
        # Test successful sell
        sell_data = {
            "team_id": self.team_ids[0],
            "sale_price": 160.0  # Higher than base price of 150
        }
        success, response = self.run_test(
            "Sell Player - Valid",
            "POST", f"players/{self.player_ids[0]}/sell", 200,
            data=sell_data
        )
        
        # Test sell below base price
        if len(self.player_ids) > 1:
            sell_data_invalid = {
                "team_id": self.team_ids[0],
                "sale_price": 50.0  # Lower than base price of 120
            }
            self.run_test(
                "Sell Player - Below Base Price",
                "POST", f"players/{self.player_ids[1]}/sell", 400,
                data=sell_data_invalid
            )
        
        # Test sell already sold player
        self.run_test(
            "Sell Already Sold Player",
            "POST", f"players/{self.player_ids[0]}/sell", 400,
            data=sell_data
        )
        
        # Test sell with insufficient purse (create expensive sale)
        if len(self.player_ids) > 1 and len(self.team_ids) > 1:
            expensive_sell = {
                "team_id": self.team_ids[1],
                "sale_price": 15000.0  # 150 Cr - more than 100 Cr purse
            }
            self.run_test(
                "Sell Player - Insufficient Purse",
                "POST", f"players/{self.player_ids[1]}/sell", 400,
                data=expensive_sell
            )

    def test_5_player_status_operations(self):
        """Test player status changes"""
        print("\n🔄 Testing Player Status Operations...")
        
        if not self.player_ids:
            print("❌ Cannot test status operations - no players available")
            return
        
        # Test mark as unsold
        if len(self.player_ids) > 1:
            success, response = self.run_test(
                "Mark Player as Unsold",
                "POST", f"players/{self.player_ids[1]}/unsold", 200
            )
        
        # Test reset player (should work for both sold and unsold)
        if len(self.player_ids) > 0:
            self.run_test(
                "Reset Sold Player",
                "POST", f"players/{self.player_ids[0]}/reset", 200
            )
        
        if len(self.player_ids) > 1:
            self.run_test(
                "Reset Unsold Player",
                "POST", f"players/{self.player_ids[1]}/reset", 200
            )

    def test_6_dashboard_and_stats(self):
        """Test dashboard and statistics"""
        print("\n📊 Testing Dashboard and Stats...")
        
        self.run_test("Get Stats", "GET", "stats", 200)
        self.run_test("Get Teams for Dashboard", "GET", "teams", 200)
        self.run_test("Get Sold Players", "GET", "players?status=sold", 200)

    def test_7_export_functionality(self):
        """Test Excel export"""
        print("\n📥 Testing Export Functionality...")
        
        try:
            response = requests.get(f"{self.base_url}/export/excel")
            success = response.status_code == 200 and response.headers.get('content-type', '').startswith('application/vnd.openxmlformats')
            details = f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            if success:
                details += f", Size: {len(response.content)} bytes"
            self.log_test("Export Excel", success, details)
        except Exception as e:
            self.log_test("Export Excel", False, f"Exception: {str(e)}")

    def test_8_cleanup_and_reset(self):
        """Test cleanup operations"""
        print("\n🧹 Testing Cleanup Operations...")
        
        # Test delete players
        for i, player_id in enumerate(self.player_ids[:2]):  # Delete first 2 players
            self.run_test(
                f"Delete Player {i+1}",
                "DELETE", f"players/{player_id}", 200
            )
        
        # Test delete teams (should fail if they have players)
        if self.team_ids:
            self.run_test(
                "Delete Team with Players",
                "DELETE", f"teams/{self.team_ids[0]}", 400
            )
        
        # Test reset entire auction
        self.run_test("Reset Entire Auction", "DELETE", "config/reset", 200)

    def run_all_tests(self):
        """Run all test suites"""
        print("🏏 Starting Cricket Auction API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        
        try:
            self.test_1_config_operations()
            self.test_2_team_operations()
            self.test_3_player_operations()
            self.test_4_selling_operations()
            self.test_5_player_status_operations()
            self.test_6_dashboard_and_stats()
            self.test_7_export_functionality()
            self.test_8_cleanup_and_reset()
            
        except Exception as e:
            print(f"❌ Test suite failed with exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CricketAuctionAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())