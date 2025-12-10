/// Carbon Credit Tracking System
/// This module provides functionality for issuing, transferring, and retiring carbon credits
module iotaproject::carbon_credits {
    use std::string::{Self, String};
    use iota::object::{Self, UID};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::event;

    // Error codes
    const EInsufficientCredits: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const ENotAuthorized: u64 = 3;

    /// Carbon Credit Certificate
    public struct CarbonCredit has key, store {
        id: UID,
        project_name: String,
        issuer: address,
        amount: u64, // Amount in tons of CO2 equivalent
        vintage_year: u64, // Year the carbon reduction occurred
        methodology: String, // Verification methodology used
        is_retired: bool,
    }

    /// Registry for tracking all carbon credits
    public struct CarbonRegistry has key {
        id: UID,
        admin: address,
        total_issued: u64,
        total_retired: u64,
    }

    /// Events
    public struct CreditIssued has copy, drop {
        credit_id: address,
        project_name: String,
        issuer: address,
        amount: u64,
        vintage_year: u64,
    }

    public struct CreditTransferred has copy, drop {
        credit_id: address,
        from: address,
        to: address,
        amount: u64,
    }

    public struct CreditRetired has copy, drop {
        credit_id: address,
        owner: address,
        amount: u64,
        retirement_reason: String,
    }

    /// Initialize the carbon credit registry
    fun init(ctx: &mut TxContext) {
        let registry = CarbonRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_issued: 0,
            total_retired: 0,
        };
        transfer::share_object(registry);
    }

    /// Create a new registry for testing purposes
    #[test_only]
    public fun create_registry_for_testing(ctx: &mut TxContext): CarbonRegistry {
        CarbonRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_issued: 0,
            total_retired: 0,
        }
    }

    /// Destroy a registry for testing purposes
    #[test_only]
    public fun destroy_registry_for_testing(registry: CarbonRegistry) {
        let CarbonRegistry { id, admin: _, total_issued: _, total_retired: _ } = registry;
        object::delete(id);
    }

    /// Issue new carbon credits
    public fun issue_credits(
        registry: &mut CarbonRegistry,
        project_name: String,
        amount: u64,
        vintage_year: u64,
        methodology: String,
        ctx: &mut TxContext
    ): CarbonCredit {
        assert!(amount > 0, EInvalidAmount);
        
        let sender = tx_context::sender(ctx);
        let credit = CarbonCredit {
            id: object::new(ctx),
            project_name,
            issuer: sender,
            amount,
            vintage_year,
            methodology,
            is_retired: false,
        };

        registry.total_issued = registry.total_issued + amount;

        event::emit(CreditIssued {
            credit_id: object::uid_to_address(&credit.id),
            project_name: credit.project_name,
            issuer: sender,
            amount,
            vintage_year,
        });

        credit
    }

    /// Transfer carbon credits to another address
    public fun transfer_credits(
        credit: CarbonCredit,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        event::emit(CreditTransferred {
            credit_id: object::uid_to_address(&credit.id),
            from: sender,
            to: recipient,
            amount: credit.amount,
        });

        transfer::public_transfer(credit, recipient);
    }

    /// Retire carbon credits (permanently remove from circulation)
    public fun retire_credits(
        registry: &mut CarbonRegistry,
        credit: CarbonCredit,
        retirement_reason: String,
        ctx: &mut TxContext
    ) {
        assert!(!credit.is_retired, EInsufficientCredits);
        
        let sender = tx_context::sender(ctx);
        let amount = credit.amount;
        
        registry.total_retired = registry.total_retired + amount;

        event::emit(CreditRetired {
            credit_id: object::uid_to_address(&credit.id),
            owner: sender,
            amount,
            retirement_reason,
        });

        // Delete the credit object to retire it permanently
        let CarbonCredit { 
            id, 
            project_name: _, 
            issuer: _, 
            amount: _, 
            vintage_year: _, 
            methodology: _, 
            is_retired: _ 
        } = credit;
        object::delete(id);
    }

    /// Get credit information
    public fun get_credit_info(credit: &CarbonCredit): (String, address, u64, u64, String, bool) {
        (
            credit.project_name,
            credit.issuer,
            credit.amount,
            credit.vintage_year,
            credit.methodology,
            credit.is_retired
        )
    }

    /// Get registry statistics
    public fun get_registry_stats(registry: &CarbonRegistry): (u64, u64) {
        (registry.total_issued, registry.total_retired)
    }

    /// Check if credits are still active (not retired)
    public fun is_active(credit: &CarbonCredit): bool {
        !credit.is_retired
    }

    /// Get available credits (total issued - total retired)
    public fun get_available_credits(registry: &CarbonRegistry): u64 {
        registry.total_issued - registry.total_retired
    }
}


