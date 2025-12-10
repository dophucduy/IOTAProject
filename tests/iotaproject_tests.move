#[test_only]
module iotaproject::carbon_credits_tests {
    use iotaproject::carbon_credits;
    use std::string;
    use iota::test_scenario;

    const ADMIN: address = @0xA;
    const USER1: address = @0xB;

    #[test]
    fun test_issue_and_check_credits() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create registry for testing
        let mut registry = carbon_credits::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        let credit = carbon_credits::issue_credits(
            &mut registry,
            string::utf8(b"Solar Farm Project"),
            100,
            2024,
            string::utf8(b"VCS Standard"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify credit properties
        let (project_name, issuer, amount, vintage_year, methodology, is_retired) = 
            carbon_credits::get_credit_info(&credit);
        
        assert!(project_name == string::utf8(b"Solar Farm Project"), 0);
        assert!(issuer == ADMIN, 1);
        assert!(amount == 100, 2);
        assert!(vintage_year == 2024, 3);
        assert!(methodology == string::utf8(b"VCS Standard"), 4);
        assert!(!is_retired, 5);
        assert!(carbon_credits::is_active(&credit), 6);
        
        // Check registry stats
        let (total_issued, total_retired) = carbon_credits::get_registry_stats(&registry);
        assert!(total_issued == 100, 7);
        assert!(total_retired == 0, 8);
        assert!(carbon_credits::get_available_credits(&registry) == 100, 9);
        
        // Clean up
        transfer::public_transfer(credit, ADMIN);
        carbon_credits::destroy_registry_for_testing(registry);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_credits() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create registry and issue credits
        let mut registry = carbon_credits::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        let credit = carbon_credits::issue_credits(
            &mut registry,
            string::utf8(b"Wind Farm Project"),
            50,
            2024,
            string::utf8(b"Gold Standard"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Transfer credits to USER1
        carbon_credits::transfer_credits(credit, USER1, test_scenario::ctx(&mut scenario));
        
        // Clean up registry
        carbon_credits::destroy_registry_for_testing(registry);
        
        // Verify USER1 received the credits
        test_scenario::next_tx(&mut scenario, USER1);
        let credit = test_scenario::take_from_sender<carbon_credits::CarbonCredit>(&scenario);
        let (_, _, amount, _, _, _) = carbon_credits::get_credit_info(&credit);
        assert!(amount == 50, 0);
        
        transfer::public_transfer(credit, USER1);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_retire_credits() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create registry and issue credits
        let mut registry = carbon_credits::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        let credit = carbon_credits::issue_credits(
            &mut registry,
            string::utf8(b"Forest Conservation"),
            75,
            2024,
            string::utf8(b"REDD+"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Retire the credits
        carbon_credits::retire_credits(
            &mut registry,
            credit,
            string::utf8(b"Corporate Net Zero Commitment"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Check registry stats after retirement
        let (total_issued, total_retired) = carbon_credits::get_registry_stats(&registry);
        assert!(total_issued == 75, 0);
        assert!(total_retired == 75, 1);
        assert!(carbon_credits::get_available_credits(&registry) == 0, 2);
        
        // Clean up
        carbon_credits::destroy_registry_for_testing(registry);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = carbon_credits::EInvalidAmount)]
    fun test_issue_zero_credits_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        let mut registry = carbon_credits::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        
        // This should fail
        let credit = carbon_credits::issue_credits(
            &mut registry,
            string::utf8(b"Invalid Project"),
            0, // Zero amount should fail
            2024,
            string::utf8(b"VCS"),
            test_scenario::ctx(&mut scenario)
        );
        
        transfer::public_transfer(credit, ADMIN);
        carbon_credits::destroy_registry_for_testing(registry);
        test_scenario::end(scenario);
    }
}