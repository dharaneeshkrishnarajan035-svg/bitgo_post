const axios = require('axios');

const DOMAIN = 'skyslopebooks.freshdesk.com';
const API_KEY = '4eFoyCOQa464e786WL';

const createRepliesNestedField = async () => {
  try {
    const payload = {
      "customers_can_edit": false,
      "label_for_customers": "Issue",
      "displayed_to_customers": false,
      "label": "Issue",
      "position": 3,
      "type": "nested_field",
      "choices": [
        {
          "label": "Books",
          "value": "Books",
          "position": 1,
          "choices": [
            {
              "label": "Accounting",
              "value": "Accounting",
              "position": 1,
              "choices": [
                {
                  "label": "Bank Feed::Activate Bank Feed",
                  "value": "Bank Feed::Activate Bank Feed",
                  "position": 1
                },
                {
                  "label": "Bank Feed::Add Bank Account",
                  "value": "Bank Feed::Add Bank Account",
                  "position": 2
                },
                {
                  "label": "Bank Feed::Duplicate Transactions",
                  "value": "Bank Feed::Duplicate Transactions",
                  "position": 3
                },
                {
                  "label": "Journals::Create/Edit Journal Entry",
                  "value": "Journals::Create/Edit Journal Entry",
                  "position": 4
                },
                {
                  "label": "Journals::Delete Journal Entry",
                  "value": "Journals::Delete Journal Entry",
                  "position": 5
                },
                {
                  "label": "Journals::Error",
                  "value": "Journals::Error",
                  "position": 6
                },
                {
                  "label": "Reconciliation::Connect/Reconnect Bank Feed",
                  "value": "Reconciliation::Connect/Reconnect Bank Feed",
                  "position": 7
                },
                {
                  "label": "Reconciliation::Error",
                  "value": "Reconciliation::Error",
                  "position": 8
                },
                {
                  "label": "Reconciliation::Find Transaction",
                  "value": "Reconciliation::Find Transaction",
                  "position": 9
                },
                {
                  "label": "Reconciliation::Import Transactions",
                  "value": "Reconciliation::Import Transactions",
                  "position": 10
                },
                {
                  "label": "Reconciliation::Payload Reconciliation",
                  "value": "Reconciliation::Payload Reconciliation",
                  "position": 11
                },
                {
                  "label": "Reconciliation::Unable to Match Bank Feed",
                  "value": "Reconciliation::Unable to Match Bank Feed",
                  "position": 12
                },
                {
                  "label": "Reconciliation::Walkthrough",
                  "value": "Reconciliation::Walkthrough",
                  "position": 13
                }
              ]
            },
            {
              "label": "Account",
              "value": "Account",
              "position": 2,
              "choices": [
                {
                  "label": "Automatic Time-Out",
                  "value": "Automatic Time-Out",
                  "position": 1
                },
                {
                  "label": "Billing Inquiry (Refer to CSM)",
                  "value": "Billing Inquiry (Refer to CSM)",
                  "position": 2
                },
                {
                  "label": "Brokerage Setup (Refer to CSM)",
                  "value": "Brokerage Setup (Refer to CSM)",
                  "position": 3
                },
                {
                  "label": "Cancellation (Refer to CSM)",
                  "value": "Cancellation (Refer to CSM)",
                  "position": 4
                },
                {
                  "label": "Change Email",
                  "value": "Change Email",
                  "position": 5
                },
                {
                  "label": "Change Password",
                  "value": "Change Password",
                  "position": 6
                },
                {
                  "label": "Login",
                  "value": "Login",
                  "position": 7
                },
                {
                  "label": "MFA::MFA Issue (Cannot Confirm/Login)",
                  "value": "MFA::MFA Issue (Cannot Confirm/Login)",
                  "position": 8
                },
                {
                  "label": "MFA::MFA Question",
                  "value": "MFA::MFA Question",
                  "position": 9
                },
                {
                  "label": "OTP Disable",
                  "value": "OTP Disable",
                  "position": 10
                },
                {
                  "label": "MFA::Reset/Remove MFA",
                  "value": "MFA::Reset/Remove MFA",
                  "position": 11
                },
                {
                  "label": "Reset Password",
                  "value": "Reset Password",
                  "position": 12
                },
                {
                  "label": "SSO Issue",
                  "value": "SSO Issue",
                  "position": 13
                }
              ]
            },
            {
              "label": "Commission Plans",
              "value": "Commission Plans",
              "position": 3,
              "choices": [
                {
                  "label": "Assign Plan",
                  "value": "Assign Plan",
                  "position": 1
                },
                {
                  "label": "Create Commission Plan",
                  "value": "Create Commission Plan",
                  "position": 2
                },
                {
                  "label": "Delete Commission Plan",
                  "value": "Delete Commission Plan",
                  "position": 3
                },
                {
                  "label": "Enable/Disable Plan",
                  "value": "Enable/Disable Plan",
                  "position": 4
                },
                {
                  "label": "Incorrect Rule Calculation",
                  "value": "Incorrect Rule Calculation",
                  "position": 5
                },
                {
                  "label": "Rules Walkthrough",
                  "value": "Rules Walkthrough",
                  "position": 6
                },
                {
                  "label": "Unenforce Plan",
                  "value": "Unenforce Plan",
                  "position": 7
                },
                {
                  "label": "Update Commission Plan",
                  "value": "Update Commission Plan",
                  "position": 8
                }
              ]
            },
            {
              "label": "Deals",
              "value": "Deals",
              "position": 4,
              "choices": [
                {
                  "label": "Adding/Editing Deal Information::Address",
                  "value": "Adding/Editing Deal Information::Address",
                  "position": 1
                },
                {
                  "label": "Adding/Editing Deal Information::Agent/Buyer/Seller/Closing Company",
                  "value": "Adding/Editing Deal Information::Agent/Buyer/Seller/Closing Company",
                  "position": 2
                },
                {
                  "label": "Adding/Editing Deal Information::Closing Date",
                  "value": "Adding/Editing Deal Information::Closing Date",
                  "position": 3
                },
                {
                  "label": "Adding/Editing Deal Information::Deal Title",
                  "value": "Adding/Editing Deal Information::Deal Title",
                  "position": 4
                },
                {
                  "label": "Additional Commission::Adding Additional Commission",
                  "value": "Additional Commission::Adding Additional Commission",
                  "position": 5
                },
                {
                  "label": "Additional Commission::Commission Locked (Rule Adding Additional Commission)",
                  "value": "Additional Commission::Commission Locked (Rule Adding Additional Commission)",
                  "position": 6
                },
                {
                  "label": "Additional Commission::Removing Additional Commission",
                  "value": "Additional Commission::Removing Additional Commission",
                  "position": 7
                },
                {
                  "label": "Approval::Approve Deal",
                  "value": "Approval::Approve Deal",
                  "position": 8
                },
                {
                  "label": "Approval::Error (Cannot Approve Deal)",
                  "value": "Approval::Error (Cannot Approve Deal)",
                  "position": 9
                },
                {
                  "label": "Approval::Out of Sequence Warning",
                  "value": "Approval::Out of Sequence Warning",
                  "position": 10
                },
                {
                  "label": "Approval::Unapproving a Deal",
                  "value": "Approval::Unapproving a Deal",
                  "position": 11
                },
                {
                  "label": "Can't Save Deal (Error)",
                  "value": "Can't Save Deal (Error)",
                  "position": 12
                },
                {
                  "label": "Classic View::Customize Rules",
                  "value": "Classic View::Customize Rules",
                  "position": 13
                },
                {
                  "label": "Classic View::Mark as Completed",
                  "value": "Classic View::Mark as Completed",
                  "position": 14
                },
                {
                  "label": "Classic View::New Edit Deal Page",
                  "value": "Classic View::New Edit Deal Page",
                  "position": 15
                },
                {
                  "label": "Classic View::Restore Rules",
                  "value": "Classic View::Restore Rules",
                  "position": 16
                },
                {
                  "label": "Commission Payer Question",
                  "value": "Commission Payer Question",
                  "position": 17
                },
                {
                  "label": "Create Deal (Dotloop)",
                  "value": "Create Deal (Dotloop)",
                  "position": 18
                },
                {
                  "label": "Create Deal (Manual)",
                  "value": "Create Deal (Manual)",
                  "position": 19
                },
                {
                  "label": "Create Deal (SkySlope)",
                  "value": "Create Deal (SkySlope)",
                  "position": 20
                },
                {
                  "label": "Deal Boards::Create/Edit Deal Board",
                  "value": "Deal Boards::Create/Edit Deal Board",
                  "position": 21
                },
                {
                  "label": "Deal Boards::Delete Deal Board",
                  "value": "Deal Boards::Delete Deal Board",
                  "position": 22
                },
                {
                  "label": "Deal Boards::Filters",
                  "value": "Deal Boards::Filters",
                  "position": 23
                },
                {
                  "label": "Deal Calculations::Adding/Removing/Adjusting Payments",
                  "value": "Deal Calculations::Adding/Removing/Adjusting Payments",
                  "position": 24
                },
                {
                  "label": "Delete Deal",
                  "value": "Delete Deal",
                  "position": 25
                },
                {
                  "label": "Disbursement::Adding/Removing Elements",
                  "value": "Disbursement::Adding/Removing Elements",
                  "position": 26
                },
                {
                  "label": "Disbursement::Adding/Removing Sales Entities",
                  "value": "Disbursement::Adding/Removing Sales Entities",
                  "position": 27
                },
                {
                  "label": "Disbursement::Deal Review",
                  "value": "Disbursement::Deal Review",
                  "position": 28
                },
                {
                  "label": "Disbursement::Editing CDA",
                  "value": "Disbursement::Editing CDA",
                  "position": 29
                },
                {
                  "label": "Disbursement::Required Fields Error",
                  "value": "Disbursement::Required Fields Error",
                  "position": 30
                },
                {
                  "label": "Disbursement::Wrong Totals on Disbursement",
                  "value": "Disbursement::Wrong Totals on Disbursement",
                  "position": 31
                },
                {
                  "label": "Documents::Agent Trade Sheet",
                  "value": "Documents::Agent Trade Sheet",
                  "position": 32
                },
                {
                  "label": "Documents::Broker Trade Sheet",
                  "value": "Documents::Broker Trade Sheet",
                  "position": 33
                },
                {
                  "label": "Documents::Disbursement Authorization",
                  "value": "Documents::Disbursement Authorization",
                  "position": 34
                },
                {
                  "label": "Dual Deal::Creating a Dual Deal",
                  "value": "Dual Deal::Creating a Dual Deal",
                  "position": 35
                },
                {
                  "label": "Dual Deal::Dual Deal Disbursement",
                  "value": "Dual Deal::Dual Deal Disbursement",
                  "position": 36
                },
                {
                  "label": "Dual Deal::Linking/Unlinking Deals",
                  "value": "Dual Deal::Linking/Unlinking Deals",
                  "position": 37
                },
                {
                  "label": "Incomplete (Draft) Deal",
                  "value": "Incomplete (Draft) Deal",
                  "position": 38
                },
                {
                  "label": "Manage Escrow::Deposit Payments",
                  "value": "Manage Escrow::Deposit Payments",
                  "position": 39
                },
                {
                  "label": "Manage Escrow::Deposit Releases",
                  "value": "Manage Escrow::Deposit Releases",
                  "position": 40
                },
                {
                  "label": "Manage Escrow::Deposit Requests",
                  "value": "Manage Escrow::Deposit Requests",
                  "position": 41
                },
                {
                  "label": "Manage Escrow::Unable to Delete Deposit",
                  "value": "Manage Escrow::Unable to Delete Deposit",
                  "position": 42
                },
                {
                  "label": "Manage Parties::Can't Find Agent::Agent Added as External Vendor (Convert to Agent)",
                  "value": "Manage Parties::Can't Find Agent::Agent Added as External Vendor (Convert to Agent)",
                  "position": 43
                },
                {
                  "label": "Manage Parties::Can't Find Agent > No User Profile",
                  "value": "Manage Parties::Can't Find Agent > No User Profile",
                  "position": 44
                },
                {
                  "label": "Manage Parties::Add/Remove Agent",
                  "value": "Manage Parties::Add/Remove Agent",
                  "position": 45
                },
                {
                  "label": "Manage Parties::Change Primary Agent",
                  "value": "Manage Parties::Change Primary Agent",
                  "position": 46
                },
                {
                  "label": "Manage Parties::Error (Cannot Save Deal)",
                  "value": "Manage Parties::Error (Cannot Save Deal)",
                  "position": 47
                },
                {
                  "label": "Manage Parties::% of Deal Split",
                  "value": "Manage Parties::% of Deal Split",
                  "position": 48
                },
                {
                  "label": "Payouts::Closing",
                  "value": "Payouts::Closing",
                  "position": 49
                },
                {
                  "label": "Payouts::Confirm Payment",
                  "value": "Payouts::Confirm Payment",
                  "position": 50
                },
                {
                  "label": "Payouts::Incomplete/Stuck",
                  "value": "Payouts::Incomplete/Stuck",
                  "position": 51
                },
                {
                  "label": "Payouts::Incorrect Payouts",
                  "value": "Payouts::Incorrect Payouts",
                  "position": 52
                },
                {
                  "label": "Payouts::Post Date",
                  "value": "Payouts::Post Date",
                  "position": 53
                },
                {
                  "label": "Payouts::Remaining",
                  "value": "Payouts::Remaining",
                  "position": 54
                },
                {
                  "label": "Payouts::Revert Payout",
                  "value": "Payouts::Revert Payout",
                  "position": 55
                },
                {
                  "label": "Processing Walkthrough",
                  "value": "Processing Walkthrough",
                  "position": 56
                },
                {
                  "label": "Referral Deal Inquiry",
                  "value": "Referral Deal Inquiry",
                  "position": 57
                },
                {
                  "label": "Required Field Hangup",
                  "value": "Required Field Hangup",
                  "position": 58
                },
                {
                  "label": "Rules::Adding a Rule",
                  "value": "Rules::Adding a Rule",
                  "position": 59
                },
                {
                  "label": "Rules::Cap Calculation Issue",
                  "value": "Rules::Cap Calculation Issue",
                  "position": 60
                },
                {
                  "label": "Rules::Incorrect Rules Calculations",
                  "value": "Rules::Incorrect Rules Calculations",
                  "position": 61
                },
                {
                  "label": "Rules::Prorate Issue",
                  "value": "Rules::Prorate Issue",
                  "position": 62
                },
                {
                  "label": "SkySlope Menu::Disconnect",
                  "value": "SkySlope Menu::Disconnect",
                  "position": 63
                },
                {
                  "label": "SkySlope Menu::Open SkySlope",
                  "value": "SkySlope Menu::Open SkySlope",
                  "position": 64
                },
                {
                  "label": "SkySlope Menu::Refresh Data",
                  "value": "SkySlope Menu::Refresh Data",
                  "position": 65
                },
                {
                  "label": "SkySlope Menu::Save Disbursement in SS",
                  "value": "SkySlope Menu::Save Disbursement in SS",
                  "position": 66
                },
                {
                  "label": "SkySlope Menu::Save Trade Sheet in SS",
                  "value": "SkySlope Menu::Save Trade Sheet in SS",
                  "position": 67
                },
                {
                  "label": "SkySlope Menu::View Details",
                  "value": "SkySlope Menu::View Details",
                  "position": 68
                },
                {
                  "label": "Sync::Create SS/Dotloop Deal Manually",
                  "value": "Sync::Create SS/Dotloop Deal Manually",
                  "position": 69
                },
                {
                  "label": "Sync::Deal Not Updating/Syncing Properly",
                  "value": "Sync::Deal Not Updating/Syncing Properly",
                  "position": 70
                },
                {
                  "label": "Sync::Deal Stuck in Processing Queue",
                  "value": "Sync::Deal Stuck in Processing Queue",
                  "position": 71
                },
                {
                  "label": "Trade Sheet::Error",
                  "value": "Trade Sheet::Error",
                  "position": 72
                },
                {
                  "label": "Trade Sheet::Inquiry",
                  "value": "Trade Sheet::Inquiry",
                  "position": 73
                },
                {
                  "label": "Update Deal Status",
                  "value": "Update Deal Status",
                  "position": 74
                },
                {
                  "label": "View Deals (Agent)",
                  "value": "View Deals (Agent)",
                  "position": 75
                },
                {
                  "label": "Deal Calculations::Commission is $0.00",
                  "value": "Deal Calculations::Commission is $0.00",
                  "position": 76
                },
                {
                  "label": "Deal Calculations::Incorrect Agent Split",
                  "value": "Deal Calculations::Incorrect Agent Split",
                  "position": 77
                },
                {
                  "label": "Deal Calculations::Incorrect Amount in DA",
                  "value": "Deal Calculations::Incorrect Amount in DA",
                  "position": 78
                },
                {
                  "label": "Deal Calculations::Incorrect Transfer::Wrong Card",
                  "value": "Deal Calculations::Incorrect Transfer::Wrong Card",
                  "position": 79
                },
                {
                  "label": "Deal Calculations::Incorrect Transfer::Wrong Receiver",
                  "value": "Deal Calculations::Incorrect Transfer::Wrong Receiver",
                  "position": 80
                },
                {
                  "label": "Deal Calculations::Incorrect Transfer::Wrong Timing (Closing/Remaining)",
                  "value": "Deal Calculations::Incorrect Transfer::Wrong Timing (Closing/Remaining)",
                  "position": 81
                },
                {
                  "label": "Disbursement::Unable To Get Correct Values",
                  "value": "Disbursement::Unable To Get Correct Values",
                  "position": 82
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 83
                }
              ]
            },
            {
              "label": "Directory",
              "value": "Directory",
              "position": 5,
              "choices": [
                {
                  "label": "Contacts::Approvals Tab",
                  "value": "Contacts::Approvals Tab",
                  "position": 1
                },
                {
                  "label": "Contacts::Compliance Tab::Anniversary Date",
                  "value": "Contacts::Compliance Tab::Anniversary Date",
                  "position": 2
                },
                {
                  "label": "Contacts::Compliance Tab::Commission Modifiers::Create/Edit Modifier",
                  "value": "Contacts::Compliance Tab::Commission Modifiers::Create/Edit Modifier",
                  "position": 3
                },
                {
                  "label": "Contacts::Compliance Tab::Commission Modifiers::Remove Modifier",
                  "value": "Contacts::Compliance Tab::Commission Modifiers::Remove Modifier",
                  "position": 4
                },
                {
                  "label": "Contacts::Compliance Tab::Commission Modifiers::Walkthrough",
                  "value": "Contacts::Compliance Tab::Commission Modifiers::Walkthrough",
                  "position": 5
                },
                {
                  "label": "Contacts::Compliance Tab::Compensation Attributes::Add/Remove Attribute",
                  "value": "Contacts::Compliance Tab::Compensation Attributes::Add/Remove Attribute",
                  "position": 6
                },
                {
                  "label": "Contacts::Compliance Tab::Compensation Attributes::Create/Edit Attribute",
                  "value": "Contacts::Compliance Tab::Compensation Attributes::Create/Edit Attribute",
                  "position": 7
                },
                {
                  "label": "Contacts::Compliance Tab::Compensation Attributes::Walkthrough",
                  "value": "Contacts::Compliance Tab::Compensation Attributes::Walkthrough",
                  "position": 8
                },
                {
                  "label": "Contacts::Compliance Tab::Hire Date",
                  "value": "Contacts::Compliance Tab::Hire Date",
                  "position": 9
                },
                {
                  "label": "Contacts::Compliance Tab::Licensing/Memberships",
                  "value": "Contacts::Compliance Tab::Licensing/Memberships",
                  "position": 10
                },
                {
                  "label": "Contacts::Entering/Editing Contact",
                  "value": "Contacts::Entering/Editing Contact",
                  "position": 11
                },
                {
                  "label": "Contacts::Locations Tab",
                  "value": "Contacts::Locations Tab",
                  "position": 12
                },
                {
                  "label": "Contacts::Merge Contacts",
                  "value": "Contacts::Merge Contacts",
                  "position": 13
                },
                {
                  "label": "Contacts::Payment Methods::Authorize.Net",
                  "value": "Contacts::Payment Methods::Authorize.Net",
                  "position": 14
                },
                {
                  "label": "Contacts::Payment Methods::Payload.co",
                  "value": "Contacts::Payment Methods::Payload.co",
                  "position": 15
                },
                {
                  "label": "Contacts::Payroll Tab::Add/Edit Tax Record",
                  "value": "Contacts::Payroll Tab::Add/Edit Tax Record",
                  "position": 16
                },
                {
                  "label": "Contacts::Payroll Tab::Agent Disbursement Instructions",
                  "value": "Contacts::Payroll Tab::Agent Disbursement Instructions",
                  "position": 17
                },
                {
                  "label": "Contacts::Records Upload",
                  "value": "Contacts::Records Upload",
                  "position": 18
                },
                {
                  "label": "Contacts::Update Agent to LLC",
                  "value": "Contacts::Update Agent to LLC",
                  "position": 19
                },
                {
                  "label": "User Profiles::Activate Profile::Connect Skyslope",
                  "value": "User Profiles::Activate Profile::Connect Skyslope",
                  "position": 20
                },
                {
                  "label": "User Profiles::Activate Profile::Send Invite",
                  "value": "User Profiles::Activate Profile::Send Invite",
                  "position": 21
                },
                {
                  "label": "User Profiles::Create Profile",
                  "value": "User Profiles::Create Profile",
                  "position": 22
                },
                {
                  "label": "User Profiles::Edit Profile::Add/Remove from Division",
                  "value": "User Profiles::Edit Profile::Add/Remove from Division",
                  "position": 23
                },
                {
                  "label": "User Profiles::Edit Profile::Add/Remove from Group",
                  "value": "User Profiles::Edit Profile::Add/Remove from Group",
                  "position": 24
                },
                {
                  "label": "User Profiles::Edit Profile::Change User Information",
                  "value": "User Profiles::Edit Profile::Change User Information",
                  "position": 25
                },
                {
                  "label": "User Profiles::Remove Duplicate Profile",
                  "value": "User Profiles::Remove Duplicate Profile",
                  "position": 26
                },
                {
                  "label": "User Profiles::Revoke Access",
                  "value": "User Profiles::Revoke Access",
                  "position": 27
                },
                {
                  "label": "User Profiles::My Business Portal",
                  "value": "User Profiles::My Business Portal",
                  "position": 28
                },
                {
                  "label": "Groups::Other",
                  "value": "Groups::Other",
                  "position": 29
                },
                {
                  "label": "Groups::Add/Remove Agents",
                  "value": "Groups::Add/Remove Agents",
                  "position": 30
                },
                {
                  "label": "Groups::Create/Delete Group",
                  "value": "Groups::Create/Delete Group",
                  "position": 31
                },
                {
                  "label": "Offices::Create/Delete Office",
                  "value": "Offices::Create/Delete Office",
                  "position": 32
                },
                {
                  "label": "Offices::Other",
                  "value": "Offices::Other",
                  "position": 33
                }
              ]
            },
            {
              "label": "Elastic Search",
              "value": "Elastic Search",
              "position": 6,
              "choices": [
                {
                  "label": "Error",
                  "value": "Error",
                  "position": 1
                },
                {
                  "label": "Unable to Find Deal/Agent/Etc. in Search",
                  "value": "Unable to Find Deal/Agent/Etc. in Search",
                  "position": 2
                },
                {
                  "label": "Using Elastic Search",
                  "value": "Using Elastic Search",
                  "position": 3
                }
              ]
            },
            {
              "label": "Integrations",
              "value": "Integrations",
              "position": 7,
              "choices": [
                {
                  "label": "Authorize.net",
                  "value": "Authorize.net",
                  "position": 1
                },
                {
                  "label": "Custom API Request",
                  "value": "Custom API Request",
                  "position": 2
                },
                {
                  "label": "Google Looker Studio / Data Studio",
                  "value": "Google Looker Studio / Data Studio",
                  "position": 3
                },
                {
                  "label": "QuickBooks",
                  "value": "QuickBooks",
                  "position": 4
                }
              ]
            },
            {
              "label": "Link Business",
              "value": "Link Business",
              "position": 8,
              "choices": [
                {
                  "label": "Link Business Error",
                  "value": "Link Business Error",
                  "position": 1
                }
              ]
            },
            {
              "label": "New Edit Deal Page",
              "value": "New Edit Deal Page",
              "position": 9,
              "choices": [
                {
                  "label": "Error (not replicated in Classic View)",
                  "value": "Error (not replicated in Classic View)",
                  "position": 1
                },
                {
                  "label": "Feedback/Feature Suggestion",
                  "value": "Feedback/Feature Suggestion",
                  "position": 2
                },
                {
                  "label": "Missing Function/Feature",
                  "value": "Missing Function/Feature",
                  "position": 3
                },
                {
                  "label": "Walkthrough",
                  "value": "Walkthrough",
                  "position": 4
                }
              ]
            },
            {
              "label": "Notifications Menu Inquiry",
              "value": "Notifications Menu Inquiry",
              "position": 10,
              "choices": []
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 11,
              "choices": [
                {
                  "label": "Feature Request/Feedback",
                  "value": "Feature Request/Feedback",
                  "position": 1
                },
                {
                  "label": "Internal Issue (Redirect to Brokerage)",
                  "value": "Internal Issue (Redirect to Brokerage)",
                  "position": 2
                },
                {
                  "label": "Spam",
                  "value": "Spam",
                  "position": 3
                },
                {
                  "label": "Tutorial/Training Request",
                  "value": "Tutorial/Training Request",
                  "position": 4
                },
                {
                  "label": "User Resolved Own Issue",
                  "value": "User Resolved Own Issue",
                  "position": 5
                },
                {
                  "label": "Wants Books",
                  "value": "Wants Books",
                  "position": 6
                },
                {
                  "label": "Wrong Email (Not Relevant)",
                  "value": "Wrong Email (Not Relevant)",
                  "position": 7
                },
                {
                  "label": "Demo/Testing Call",
                  "value": "Demo/Testing Call",
                  "position": 8
                },
                {
                  "label": "Demo/Testing Chat",
                  "value": "Demo/Testing Chat",
                  "position": 9
                },
                {
                  "label": "Demo/Testing Email",
                  "value": "Demo/Testing Email",
                  "position": 10
                }
              ]
            },
            {
              "label": "Purchases",
              "value": "Purchases",
              "position": 12,
              "choices": [
                {
                  "label": "Bills::Agent View (Reference Documents)",
                  "value": "Bills::Agent View (Reference Documents)",
                  "position": 1
                },
                {
                  "label": "Bills::Apply Credit",
                  "value": "Bills::Apply Credit",
                  "position": 2
                },
                {
                  "label": "Bills::Create Bill",
                  "value": "Bills::Create Bill",
                  "position": 3
                },
                {
                  "label": "Bills::Delete Bill",
                  "value": "Bills::Delete Bill",
                  "position": 4
                },
                {
                  "label": "Bills::Edit Bill",
                  "value": "Bills::Edit Bill",
                  "position": 5
                },
                {
                  "label": "Bills::Pay Bill",
                  "value": "Bills::Pay Bill",
                  "position": 6
                },
                {
                  "label": "Bills::View Bill(s)",
                  "value": "Bills::View Bill(s)",
                  "position": 7
                },
                {
                  "label": "Bills::Void Bill",
                  "value": "Bills::Void Bill",
                  "position": 8
                },
                {
                  "label": "Payments Made::Check Payment",
                  "value": "Payments Made::Check Payment",
                  "position": 9
                },
                {
                  "label": "Payments Made::Delete Payment",
                  "value": "Payments Made::Delete Payment",
                  "position": 10
                },
                {
                  "label": "Payments Made::Edit Payment",
                  "value": "Payments Made::Edit Payment",
                  "position": 11
                },
                {
                  "label": "Payments Made::Find Payment",
                  "value": "Payments Made::Find Payment",
                  "position": 12
                },
                {
                  "label": "Payments Made::Print Check",
                  "value": "Payments Made::Print Check",
                  "position": 13
                },
                {
                  "label": "Payments Made::Print Paystub",
                  "value": "Payments Made::Print Paystub",
                  "position": 14
                },
                {
                  "label": "Payments Made::Revert Payment",
                  "value": "Payments Made::Revert Payment",
                  "position": 15
                },
                {
                  "label": "Payments Made::Uncleared Check",
                  "value": "Payments Made::Uncleared Check",
                  "position": 16
                },
                {
                  "label": "Recurring Bills::Create Recurring Bill",
                  "value": "Recurring Bills::Create Recurring Bill",
                  "position": 17
                },
                {
                  "label": "Recurring Bills::Edit Recurring Bill",
                  "value": "Recurring Bills::Edit Recurring Bill",
                  "position": 18
                },
                {
                  "label": "Recurring Bills::Error in Recurring Bill",
                  "value": "Recurring Bills::Error in Recurring Bill",
                  "position": 19
                },
                {
                  "label": "Recurring Bills::Recurring Bill Issue",
                  "value": "Recurring Bills::Recurring Bill Issue",
                  "position": 20
                },
                {
                  "label": "Recurring Bills::Recurring Bill Not Working",
                  "value": "Recurring Bills::Recurring Bill Not Working",
                  "position": 21
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 22
                },
                {
                  "label": "Vendor Credit::Apply Credit",
                  "value": "Vendor Credit::Apply Credit",
                  "position": 23
                },
                {
                  "label": "Vendor Credit::Create/Void Credit",
                  "value": "Vendor Credit::Create/Void Credit",
                  "position": 24
                },
                {
                  "label": "Vendor Credit::Other",
                  "value": "Vendor Credit::Other",
                  "position": 25
                },
                {
                  "label": "Vendor Credit::Source Documents",
                  "value": "Vendor Credit::Source Documents",
                  "position": 26
                }
              ]
            },
            {
              "label": "Reporting",
              "value": "Reporting",
              "position": 13,
              "choices": [
                {
                  "label": "Agent Reporting",
                  "value": "Agent Reporting",
                  "position": 1
                },
                {
                  "label": "Dashboard::Cap Tracking",
                  "value": "Dashboard::Cap Tracking",
                  "position": 2
                },
                {
                  "label": "Dashboard::Dashboard Walkthrough/Overview",
                  "value": "Dashboard::Dashboard Walkthrough/Overview",
                  "position": 3
                },
                {
                  "label": "Deal Reports::Agent Performance",
                  "value": "Deal Reports::Agent Performance",
                  "position": 4
                },
                {
                  "label": "Deal Reports::Average Sales",
                  "value": "Deal Reports::Average Sales",
                  "position": 5
                },
                {
                  "label": "Deal Reports::Commission Expense",
                  "value": "Deal Reports::Commission Expense",
                  "position": 6
                },
                {
                  "label": "Deal Reports::Detailed Transactions",
                  "value": "Deal Reports::Detailed Transactions",
                  "position": 7
                },
                {
                  "label": "Deal Reports::Source of Business",
                  "value": "Deal Reports::Source of Business",
                  "position": 8
                },
                {
                  "label": "Deal Reports::Summary Transactions",
                  "value": "Deal Reports::Summary Transactions",
                  "position": 9
                },
                {
                  "label": "Financial Reports::1099 Reports",
                  "value": "Financial Reports::1099 Reports",
                  "position": 10
                },
                {
                  "label": "Financial Reports::Accounting Trial Balance",
                  "value": "Financial Reports::Accounting Trial Balance",
                  "position": 11
                },
                {
                  "label": "Financial Reports::Account Transactions",
                  "value": "Financial Reports::Account Transactions",
                  "position": 12
                },
                {
                  "label": "Financial Reports::Account Type Summary",
                  "value": "Financial Reports::Account Type Summary",
                  "position": 13
                },
                {
                  "label": "Financial Reports::Aging Reports",
                  "value": "Financial Reports::Aging Reports",
                  "position": 14
                },
                {
                  "label": "Financial Reports::Balance Sheet",
                  "value": "Financial Reports::Balance Sheet",
                  "position": 15
                },
                {
                  "label": "Financial Reports::Cash Flow Statement",
                  "value": "Financial Reports::Cash Flow Statement",
                  "position": 16
                },
                {
                  "label": "Financial Reports::General Ledger",
                  "value": "Financial Reports::General Ledger",
                  "position": 17
                },
                {
                  "label": "Financial Reports::Income Statement",
                  "value": "Financial Reports::Income Statement",
                  "position": 18
                },
                {
                  "label": "Financial Reports::Journal",
                  "value": "Financial Reports::Journal",
                  "position": 19
                },
                {
                  "label": "Financial Reports::Recurring Invoice",
                  "value": "Financial Reports::Recurring Invoice",
                  "position": 20
                },
                {
                  "label": "Financial Reports::Summary Trial Balance",
                  "value": "Financial Reports::Summary Trial Balance",
                  "position": 21
                },
                {
                  "label": "Financial Reports::Trust Reconciliation",
                  "value": "Financial Reports::Trust Reconciliation",
                  "position": 22
                },
                {
                  "label": "General Reports::Contact",
                  "value": "General Reports::Contact",
                  "position": 23
                },
                {
                  "label": "General Reports::Membership",
                  "value": "General Reports::Membership",
                  "position": 24
                },
                {
                  "label": "General Reports::Product",
                  "value": "General Reports::Product",
                  "position": 25
                },
                {
                  "label": "General Reports::Progress Reports",
                  "value": "General Reports::Progress Reports",
                  "position": 26
                },
                {
                  "label": "General Reports::Summary Cap",
                  "value": "General Reports::Summary Cap",
                  "position": 27
                },
                {
                  "label": "Report Walkthrough",
                  "value": "Report Walkthrough",
                  "position": 28
                }
              ]
            },
            {
              "label": "Sales",
              "value": "Sales",
              "position": 14,
              "choices": [
                {
                  "label": "Invoices::Agent View (Reference Documents)",
                  "value": "Invoices::Agent View (Reference Documents)",
                  "position": 1
                },
                {
                  "label": "Invoices::Apply Credit",
                  "value": "Invoices::Apply Credit",
                  "position": 2
                },
                {
                  "label": "Invoices::Charge Customer (Credit Card)",
                  "value": "Invoices::Charge Customer (Credit Card)",
                  "position": 3
                },
                {
                  "label": "Invoices::Deduct From Deal",
                  "value": "Invoices::Deduct From Deal",
                  "position": 4
                },
                {
                  "label": "Invoices::Delete Invoice",
                  "value": "Invoices::Delete Invoice",
                  "position": 5
                },
                {
                  "label": "Invoices::Edit Invoice",
                  "value": "Invoices::Edit Invoice",
                  "position": 6
                },
                {
                  "label": "Invoices::Pay Invoice (Agent)",
                  "value": "Invoices::Pay Invoice (Agent)",
                  "position": 7
                },
                {
                  "label": "Invoices::Recurring Invoices::Accepted Form of Payment",
                  "value": "Invoices::Recurring Invoices::Accepted Form of Payment",
                  "position": 8
                },
                {
                  "label": "Invoices::Recurring Invoices::Auto-Charge Settings",
                  "value": "Invoices::Recurring Invoices::Auto-Charge Settings",
                  "position": 9
                },
                {
                  "label": "Invoices::Recurring Invoices::Edit/Delete Recurring Invoice",
                  "value": "Invoices::Recurring Invoices::Edit/Delete Recurring Invoice",
                  "position": 10
                },
                {
                  "label": "Invoices::Recurring Invoices::Error (Other)",
                  "value": "Invoices::Recurring Invoices::Error (Other)",
                  "position": 11
                },
                {
                  "label": "Invoices::Recurring Invoices::Invoice Not Generating",
                  "value": "Invoices::Recurring Invoices::Invoice Not Generating",
                  "position": 12
                },
                {
                  "label": "Invoices::Recurring Invoices::Unable to Create Recurring Invoice",
                  "value": "Invoices::Recurring Invoices::Unable to Create Recurring Invoice",
                  "position": 13
                },
                {
                  "label": "Invoices::Remove Payment",
                  "value": "Invoices::Remove Payment",
                  "position": 14
                },
                {
                  "label": "Invoices::Send/Resend Invoice",
                  "value": "Invoices::Send/Resend Invoice",
                  "position": 15
                },
                {
                  "label": "Invoice Statements",
                  "value": "Invoice Statements",
                  "position": 16
                },
                {
                  "label": "Credit Notes::Apply Note",
                  "value": "Credit Notes::Apply Note",
                  "position": 17
                },
                {
                  "label": "Credit Notes::Create/Void Note",
                  "value": "Credit Notes::Create/Void Note",
                  "position": 18
                },
                {
                  "label": "Credit Notes::Create Recurring Note",
                  "value": "Credit Notes::Create Recurring Note",
                  "position": 19
                },
                {
                  "label": "Credit Notes::Other",
                  "value": "Credit Notes::Other",
                  "position": 20
                },
                {
                  "label": "Credit Notes::Source Documents",
                  "value": "Credit Notes::Source Documents",
                  "position": 21
                },
                {
                  "label": "Invoices::Associate Invoice",
                  "value": "Invoices::Associate Invoice",
                  "position": 22
                },
                {
                  "label": "Invoices::Connect Invoice",
                  "value": "Invoices::Connect Invoice",
                  "position": 23
                },
                {
                  "label": "Invoices::Create/Void Invoice",
                  "value": "Invoices::Create/Void Invoice",
                  "position": 24
                },
                {
                  "label": "Invoices::Create Recurring Invoice",
                  "value": "Invoices::Create Recurring Invoice",
                  "position": 25
                },
                {
                  "label": "Invoices::Disconnect Invoice",
                  "value": "Invoices::Disconnect Invoice",
                  "position": 26
                },
                {
                  "label": "Invoices::Other",
                  "value": "Invoices::Other",
                  "position": 27
                },
                {
                  "label": "Invoices::Source Documents",
                  "value": "Invoices::Source Documents",
                  "position": 28
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 29
                }
              ]
            },
            {
              "label": "SkySlope",
              "value": "SkySlope",
              "position": 15,
              "choices": [
                {
                  "label": "Connect User Account",
                  "value": "Connect User Account",
                  "position": 1
                },
                {
                  "label": "Auto Create Not Working",
                  "value": "Auto Create Not Working",
                  "position": 2
                },
                {
                  "label": "Cannot Find Deal",
                  "value": "Cannot Find Deal",
                  "position": 3
                },
                {
                  "label": "Cannot Pull Deal",
                  "value": "Cannot Pull Deal",
                  "position": 4
                },
                {
                  "label": "Deal Not Updating",
                  "value": "Deal Not Updating",
                  "position": 5
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 6
                }
              ]
            },
            {
              "label": "Syswide",
              "value": "Syswide",
              "position": 16,
              "choices": [
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 1
                }
              ]
            },
            {
              "label": "SysWide",
              "value": "SysWide",
              "position": 17,
              "choices": [
                {
                  "label": "Site Outage",
                  "value": "Site Outage",
                  "position": 1
                },
                {
                  "label": "Slowness",
                  "value": "Slowness",
                  "position": 2
                }
              ]
            },
            {
              "label": "Company",
              "value": "Company",
              "position": 18,
              "choices": [
                {
                  "label": "Directory::Roles::Assign Role",
                  "value": "Directory::Roles::Assign Role",
                  "position": 1
                },
                {
                  "label": "Directory::Roles::Create/Delete Role",
                  "value": "Directory::Roles::Create/Delete Role",
                  "position": 2
                },
                {
                  "label": "Directory::Roles::Edit Role",
                  "value": "Directory::Roles::Edit Role",
                  "position": 3
                },
                {
                  "label": "Directory::Roles::Other",
                  "value": "Directory::Roles::Other",
                  "position": 4
                },
                {
                  "label": "Finance::Chart of Accounts::Create/Delete Ledger Account",
                  "value": "Finance::Chart of Accounts::Create/Delete Ledger Account",
                  "position": 5
                },
                {
                  "label": "Finance::Chart of Accounts::Edit Ledger Account",
                  "value": "Finance::Chart of Accounts::Edit Ledger Account",
                  "position": 6
                },
                {
                  "label": "Finance::Chart of Accounts::Other",
                  "value": "Finance::Chart of Accounts::Other",
                  "position": 7
                },
                {
                  "label": "Finance::Data::Export::Journal Entries",
                  "value": "Finance::Data::Export::Journal Entries",
                  "position": 8
                },
                {
                  "label": "Finance::Data::Export::Other",
                  "value": "Finance::Data::Export::Other",
                  "position": 9
                },
                {
                  "label": "Finance::Data::Export::Products/Services",
                  "value": "Finance::Data::Export::Products/Services",
                  "position": 10
                },
                {
                  "label": "Finance::Data::Export::Profiles",
                  "value": "Finance::Data::Export::Profiles",
                  "position": 11
                },
                {
                  "label": "Finance::Data::Import::Chart of Accounts",
                  "value": "Finance::Data::Import::Chart of Accounts",
                  "position": 12
                },
                {
                  "label": "Finance::Data::Import::Contacts",
                  "value": "Finance::Data::Import::Contacts",
                  "position": 13
                },
                {
                  "label": "Finance::Data::Import::Deals",
                  "value": "Finance::Data::Import::Deals",
                  "position": 14
                },
                {
                  "label": "Finance::Data::Import::Invoices",
                  "value": "Finance::Data::Import::Invoices",
                  "position": 15
                },
                {
                  "label": "Finance::Data::Import::Other",
                  "value": "Finance::Data::Import::Other",
                  "position": 16
                },
                {
                  "label": "Finance::Data::Import::Profile",
                  "value": "Finance::Data::Import::Profile",
                  "position": 17
                },
                {
                  "label": "Finance::Data::Other",
                  "value": "Finance::Data::Other",
                  "position": 18
                },
                {
                  "label": "Finance::Journal::Create/Delete Entry",
                  "value": "Finance::Journal::Create/Delete Entry",
                  "position": 19
                },
                {
                  "label": "Finance::Journal::Edit Service/Product",
                  "value": "Finance::Journal::Edit Service/Product",
                  "position": 20
                },
                {
                  "label": "Finance::Journal::Other",
                  "value": "Finance::Journal::Other",
                  "position": 21
                },
                {
                  "label": "Finance::Opening Balances::Entering/Updating Balance",
                  "value": "Finance::Opening Balances::Entering/Updating Balance",
                  "position": 22
                },
                {
                  "label": "Finance::Opening Balances::Other",
                  "value": "Finance::Opening Balances::Other",
                  "position": 23
                },
                {
                  "label": "Finance::Other",
                  "value": "Finance::Other",
                  "position": 24
                },
                {
                  "label": "Finance::Services/Products::Create/Delete Service/Product",
                  "value": "Finance::Services/Products::Create/Delete Service/Product",
                  "position": 25
                },
                {
                  "label": "Finance::Services/Products::Edit Service/Product",
                  "value": "Finance::Services/Products::Edit Service/Product",
                  "position": 26
                },
                {
                  "label": "Finance::Services/Products::Other",
                  "value": "Finance::Services/Products::Other",
                  "position": 27
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 28
                }
              ]
            },
            {
              "label": "Dotloop",
              "value": "Dotloop",
              "position": 19,
              "choices": [
                {
                  "label": "Auto Create Not Working",
                  "value": "Auto Create Not Working",
                  "position": 1
                },
                {
                  "label": "Cannot Find Deal",
                  "value": "Cannot Find Deal",
                  "position": 2
                },
                {
                  "label": "Cannot Pull Deal",
                  "value": "Cannot Pull Deal",
                  "position": 3
                },
                {
                  "label": "Deal Not Updating",
                  "value": "Deal Not Updating",
                  "position": 4
                }
              ]
            },
            {
              "label": "Lending",
              "value": "Lending",
              "position": 20,
              "choices": [
                {
                  "label": "Advances::Create/Delete Advance",
                  "value": "Advances::Create/Delete Advance",
                  "position": 1
                },
                {
                  "label": "Advances::Other",
                  "value": "Advances::Other",
                  "position": 2
                },
                {
                  "label": "Garnishments::Create/Delete Garnishment",
                  "value": "Garnishments::Create/Delete Garnishment",
                  "position": 3
                },
                {
                  "label": "Garnishments::Other",
                  "value": "Garnishments::Other",
                  "position": 4
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 5
                }
              ]
            },
            {
              "label": "Settings",
              "value": "Settings",
              "position": 21,
              "choices": [
                {
                  "label": "Enter/Update Company Address",
                  "value": "Enter/Update Company Address",
                  "position": 1
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 2
                },
                {
                  "label": "Update Billing Address",
                  "value": "Update Billing Address",
                  "position": 3
                },
                {
                  "label": "Update Default Disbursement Address",
                  "value": "Update Default Disbursement Address",
                  "position": 4
                },
                {
                  "label": "Update Payroll Address",
                  "value": "Update Payroll Address",
                  "position": 5
                }
              ]
            },
            {
              "label": "Muhnee",
              "value": "Muhnee",
              "position": 22,
              "choices": [
                {
                  "label": "Bank Connection",
                  "value": "Bank Connection",
                  "position": 1
                },
                {
                  "label": "Bank Verification",
                  "value": "Bank Verification",
                  "position": 2
                },
                {
                  "label": "KYC/KYB Approvals",
                  "value": "KYC/KYB Approvals",
                  "position": 3
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 4
                },
                {
                  "label": "Legacy Zoho Tickets",
                  "value": "Legacy Zoho Tickets",
                  "position": 5
                }
              ]
            },
            {
              "label": "Legacy Zoho Tickets",
              "value": "Legacy Zoho Tickets",
              "position": 23,
              "choices": []
            }
          ]
        },
        {
          "label": "Cyberco",
          "value": "Cyberco",
          "position": 2,
          "choices": [
            {
              "label": "Direct to Cyberco Support",
              "value": "Direct to Cyberco Support",
              "position": 1,
              "choices": []
            }
          ]
        },
        {
          "label": "Payload",
          "value": "Payload",
          "position": 3,
          "choices": [
            {
              "label": "Account Closed/Invalid Error",
              "value": "Account Closed/Invalid Error",
              "position": 1,
              "choices": []
            },
            {
              "label": "Account Info",
              "value": "Account Info",
              "position": 2,
              "choices": [
                {
                  "label": "Connect Bank",
                  "value": "Connect Bank",
                  "position": 1
                }
              ]
            },
            {
              "label": "Add Account",
              "value": "Add Account",
              "position": 3,
              "choices": [
                {
                  "label": "Trust Account",
                  "value": "Trust Account",
                  "position": 1
                }
              ]
            },
            {
              "label": "Cancel Payment",
              "value": "Cancel Payment",
              "position": 4,
              "choices": []
            },
            {
              "label": "Convenience/Service Fee Inquiry",
              "value": "Convenience/Service Fee Inquiry",
              "position": 5,
              "choices": []
            },
            {
              "label": "Delayed Transfer",
              "value": "Delayed Transfer",
              "position": 6,
              "choices": []
            },
            {
              "label": "Disconnect Account",
              "value": "Disconnect Account",
              "position": 7,
              "choices": []
            },
            {
              "label": "Failed Transfer",
              "value": "Failed Transfer",
              "position": 8,
              "choices": []
            },
            {
              "label": "Notification Email",
              "value": "Notification Email",
              "position": 9,
              "choices": []
            },
            {
              "label": "Payload Issue (Direct to Payload Support)",
              "value": "Payload Issue (Direct to Payload Support)",
              "position": 10,
              "choices": []
            },
            {
              "label": "Processing Timeline",
              "value": "Processing Timeline",
              "position": 11,
              "choices": []
            },
            {
              "label": "Setup/Walkthrough",
              "value": "Setup/Walkthrough",
              "position": 12,
              "choices": [
                {
                  "label": "Agent Banking Info",
                  "value": "Agent Banking Info",
                  "position": 1
                },
                {
                  "label": "Onboarding",
                  "value": "Onboarding",
                  "position": 2
                }
              ]
            }
          ]
        },
        {
          "label": "SkySlope",
          "value": "SkySlope",
          "position": 4,
          "choices": [
            {
              "label": "Apps Menu",
              "value": "Apps Menu",
              "position": 1,
              "choices": []
            },
            {
              "label": "Suite Support (Referred to SS Support)",
              "value": "Suite Support (Referred to SS Support)",
              "position": 2,
              "choices": []
            },
            {
              "label": "Wants SkySlope",
              "value": "Wants SkySlope",
              "position": 3,
              "choices": []
            }
          ]
        },
        {
          "label": "User Machine",
          "value": "User Machine",
          "position": 5,
          "choices": [
            {
              "label": "Browser Issue",
              "value": "Browser Issue",
              "position": 1,
              "choices": [
                {
                  "label": "Chrome",
                  "value": "Chrome",
                  "position": 1
                },
                {
                  "label": "Edge",
                  "value": "Edge",
                  "position": 2
                },
                {
                  "label": "Firefox",
                  "value": "Firefox",
                  "position": 3
                },
                {
                  "label": "Opera",
                  "value": "Opera",
                  "position": 4
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 5
                },
                {
                  "label": "Refresh Page",
                  "value": "Refresh Page",
                  "position": 6
                },
                {
                  "label": "Safari",
                  "value": "Safari",
                  "position": 7
                }
              ]
            },
            {
              "label": "Clear Cache & Cookies",
              "value": "Clear Cache & Cookies",
              "position": 2,
              "choices": []
            },
            {
              "label": "OS Issue",
              "value": "OS Issue",
              "position": 3,
              "choices": [
                {
                  "label": "ChromeOS",
                  "value": "ChromeOS",
                  "position": 1
                },
                {
                  "label": "MacOS",
                  "value": "MacOS",
                  "position": 2
                },
                {
                  "label": "Other",
                  "value": "Other",
                  "position": 3
                },
                {
                  "label": "Windows",
                  "value": "Windows",
                  "position": 4
                }
              ]
            },
            {
              "label": "Printing",
              "value": "Printing",
              "position": 4,
              "choices": [
                {
                  "label": "MacOS Auto-Redact",
                  "value": "MacOS Auto-Redact",
                  "position": 1
                },
                {
                  "label": "Printing Error",
                  "value": "Printing Error",
                  "position": 2
                }
              ]
            },
            {
              "label": "Slow Internet Connection",
              "value": "Slow Internet Connection",
              "position": 5,
              "choices": []
            },
            {
              "label": "User Machine Issue",
              "value": "User Machine Issue",
              "position": 6,
              "choices": []
            }
          ]
        }
      ],
      "dependent_fields": [
        {
          "label": "Root Issue",
          "label_for_customers": "Root Issue",
          "level": 2
        },
        {
          "label": "Sub Issue",
          "label_for_customers": "Sub Issue",
          "level": 3
        }
      ]
    };

    const res = await axios.post(
      `https://${DOMAIN}/api/v2/admin/ticket_fields`,
      payload,
      {
        auth: {
          username: API_KEY,
          password: 'X'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Categorize nested field created successfully:', res.data);
  } catch (error) {
    console.error('Error creating nested field:', error.response?.data || error.message);
  }
};

createRepliesNestedField();

//REPLIES PAYLOAD
const payload = {
  "customers_can_edit": false,
  "label_for_customers": "Categorize Open Ticket As",
  "displayed_to_customers": false,
  "label": "Categorize Open Ticket As",
  "position": 4,
  "type": "nested_field",
  "choices": [
    {
      "label": "Escalated",
      "value": "Escalated",
      "position": 1,
      "choices": [
        {
          "label": "Dev Review",
          "value": "Dev Review",
          "position": 1,
          "choices": []
        },
        {
          "label": "JIRA",
          "value": "JIRA",
          "position": 2,
          "choices": []
        }
      ]
    },
    {
      "label": "Leadership Review",
      "value": "Leadership Review",
      "position": 2,
      "choices": []
    },
    {
      "label": "Support QA Review",
      "value": "Support QA Review",
      "position": 3,
      "choices": [
        {
          "label": "Non Urgent",
          "value": "Non Urgent",
          "position": 1,
          "choices": []
        },
        {
          "label": "Normal",
          "value": "Normal",
          "position": 2,
          "choices": []
        },
        {
          "label": "Urgent",
          "value": "Urgent",
          "position": 3,
          "choices": []
        }
      ]
    },
    {
      "label": "System-Wide Issue/Outage",
      "value": "System-Wide Issue/Outage",
      "position": 4,
      "choices": []
    }
  ],
  "dependent_fields": [
    {
      "label": "Root Category",
      "label_for_customers": "Root Category",
      "level": 2
    },
    {
      "label": "Sub Category",
      "label_for_customers": "Sub Category",
      "level": 3
    }
  ]
};

// ISSUE PAYLOAD
const issuePayload = {
  "customers_can_edit": false,
  "label_for_customers": "Issue",
  "displayed_to_customers": false,
  "label": "Issue",
  "position": 3,
  "type": "nested_field",
  "choices": [
    {
      "label": "Books",
      "value": "Books",
      "position": 1,
      "choices": [
        {
          "label": "Accounting",
          "value": "Accounting",
          "position": 1,
          "choices": [
            {
              "label": "Bank Feed::Activate Bank Feed",
              "value": "Bank Feed::Activate Bank Feed",
              "position": 1
            },
            {
              "label": "Bank Feed::Add Bank Account",
              "value": "Bank Feed::Add Bank Account",
              "position": 2
            },
            {
              "label": "Bank Feed::Duplicate Transactions",
              "value": "Bank Feed::Duplicate Transactions",
              "position": 3
            },
            {
              "label": "Journals::Create/Edit Journal Entry",
              "value": "Journals::Create/Edit Journal Entry",
              "position": 4
            },
            {
              "label": "Journals::Delete Journal Entry",
              "value": "Journals::Delete Journal Entry",
              "position": 5
            },
            {
              "label": "Journals::Error",
              "value": "Journals::Error",
              "position": 6
            },
            {
              "label": "Reconciliation::Connect/Reconnect Bank Feed",
              "value": "Reconciliation::Connect/Reconnect Bank Feed",
              "position": 7
            },
            {
              "label": "Reconciliation::Error",
              "value": "Reconciliation::Error",
              "position": 8
            },
            {
              "label": "Reconciliation::Find Transaction",
              "value": "Reconciliation::Find Transaction",
              "position": 9
            },
            {
              "label": "Reconciliation::Import Transactions",
              "value": "Reconciliation::Import Transactions",
              "position": 10
            },
            {
              "label": "Reconciliation::Payload Reconciliation",
              "value": "Reconciliation::Payload Reconciliation",
              "position": 11
            },
            {
              "label": "Reconciliation::Unable to Match Bank Feed",
              "value": "Reconciliation::Unable to Match Bank Feed",
              "position": 12
            },
            {
              "label": "Reconciliation::Walkthrough",
              "value": "Reconciliation::Walkthrough",
              "position": 13
            }
          ]
        },
        {
          "label": "Account",
          "value": "Account",
          "position": 2,
          "choices": [
            {
              "label": "Automatic Time-Out",
              "value": "Automatic Time-Out",
              "position": 1
            },
            {
              "label": "Billing Inquiry (Refer to CSM)",
              "value": "Billing Inquiry (Refer to CSM)",
              "position": 2
            },
            {
              "label": "Brokerage Setup (Refer to CSM)",
              "value": "Brokerage Setup (Refer to CSM)",
              "position": 3
            },
            {
              "label": "Cancellation (Refer to CSM)",
              "value": "Cancellation (Refer to CSM)",
              "position": 4
            },
            {
              "label": "Change Email",
              "value": "Change Email",
              "position": 5
            },
            {
              "label": "Change Password",
              "value": "Change Password",
              "position": 6
            },
            {
              "label": "Login",
              "value": "Login",
              "position": 7
            },
            {
              "label": "MFA::MFA Issue (Cannot Confirm/Login)",
              "value": "MFA::MFA Issue (Cannot Confirm/Login)",
              "position": 8
            },
            {
              "label": "MFA::MFA Question",
              "value": "MFA::MFA Question",
              "position": 9
            },
            {
              "label": "OTP Disable",
              "value": "OTP Disable",
              "position": 10
            },
            {
              "label": "MFA::Reset/Remove MFA",
              "value": "MFA::Reset/Remove MFA",
              "position": 11
            },
            {
              "label": "Reset Password",
              "value": "Reset Password",
              "position": 12
            },
            {
              "label": "SSO Issue",
              "value": "SSO Issue",
              "position": 13
            }
          ]
        },
        {
          "label": "Commission Plans",
          "value": "Commission Plans",
          "position": 3,
          "choices": [
            {
              "label": "Assign Plan",
              "value": "Assign Plan",
              "position": 1
            },
            {
              "label": "Create Commission Plan",
              "value": "Create Commission Plan",
              "position": 2
            },
            {
              "label": "Delete Commission Plan",
              "value": "Delete Commission Plan",
              "position": 3
            },
            {
              "label": "Enable/Disable Plan",
              "value": "Enable/Disable Plan",
              "position": 4
            },
            {
              "label": "Incorrect Rule Calculation",
              "value": "Incorrect Rule Calculation",
              "position": 5
            },
            {
              "label": "Rules Walkthrough",
              "value": "Rules Walkthrough",
              "position": 6
            },
            {
              "label": "Unenforce Plan",
              "value": "Unenforce Plan",
              "position": 7
            },
            {
              "label": "Update Commission Plan",
              "value": "Update Commission Plan",
              "position": 8
            }
          ]
        },
        {
          "label": "Deals",
          "value": "Deals",
          "position": 4,
          "choices": [
            {
              "label": "Adding/Editing Deal Information::Address",
              "value": "Adding/Editing Deal Information::Address",
              "position": 1
            },
            {
              "label": "Adding/Editing Deal Information::Agent/Buyer/Seller/Closing Company",
              "value": "Adding/Editing Deal Information::Agent/Buyer/Seller/Closing Company",
              "position": 2
            },
            {
              "label": "Adding/Editing Deal Information::Closing Date",
              "value": "Adding/Editing Deal Information::Closing Date",
              "position": 3
            },
            {
              "label": "Adding/Editing Deal Information::Deal Title",
              "value": "Adding/Editing Deal Information::Deal Title",
              "position": 4
            },
            {
              "label": "Additional Commission::Adding Additional Commission",
              "value": "Additional Commission::Adding Additional Commission",
              "position": 5
            },
            {
              "label": "Additional Commission::Commission Locked (Rule Adding Additional Commission)",
              "value": "Additional Commission::Commission Locked (Rule Adding Additional Commission)",
              "position": 6
            },
            {
              "label": "Additional Commission::Removing Additional Commission",
              "value": "Additional Commission::Removing Additional Commission",
              "position": 7
            },
            {
              "label": "Approval::Approve Deal",
              "value": "Approval::Approve Deal",
              "position": 8
            },
            {
              "label": "Approval::Error (Cannot Approve Deal)",
              "value": "Approval::Error (Cannot Approve Deal)",
              "position": 9
            },
            {
              "label": "Approval::Out of Sequence Warning",
              "value": "Approval::Out of Sequence Warning",
              "position": 10
            },
            {
              "label": "Approval::Unapproving a Deal",
              "value": "Approval::Unapproving a Deal",
              "position": 11
            },
            {
              "label": "Can't Save Deal (Error)",
              "value": "Can't Save Deal (Error)",
              "position": 12
            },
            {
              "label": "Classic View::Customize Rules",
              "value": "Classic View::Customize Rules",
              "position": 13
            },
            {
              "label": "Classic View::Mark as Completed",
              "value": "Classic View::Mark as Completed",
              "position": 14
            },
            {
              "label": "Classic View::New Edit Deal Page",
              "value": "Classic View::New Edit Deal Page",
              "position": 15
            },
            {
              "label": "Classic View::Restore Rules",
              "value": "Classic View::Restore Rules",
              "position": 16
            },
            {
              "label": "Commission Payer Question",
              "value": "Commission Payer Question",
              "position": 17
            },
            {
              "label": "Create Deal (Dotloop)",
              "value": "Create Deal (Dotloop)",
              "position": 18
            },
            {
              "label": "Create Deal (Manual)",
              "value": "Create Deal (Manual)",
              "position": 19
            },
            {
              "label": "Create Deal (SkySlope)",
              "value": "Create Deal (SkySlope)",
              "position": 20
            },
            {
              "label": "Deal Boards::Create/Edit Deal Board",
              "value": "Deal Boards::Create/Edit Deal Board",
              "position": 21
            },
            {
              "label": "Deal Boards::Delete Deal Board",
              "value": "Deal Boards::Delete Deal Board",
              "position": 22
            },
            {
              "label": "Deal Boards::Filters",
              "value": "Deal Boards::Filters",
              "position": 23
            },
            {
              "label": "Deal Calculations::Adding/Removing/Adjusting Payments",
              "value": "Deal Calculations::Adding/Removing/Adjusting Payments",
              "position": 24
            },
            {
              "label": "Delete Deal",
              "value": "Delete Deal",
              "position": 25
            },
            {
              "label": "Disbursement::Adding/Removing Elements",
              "value": "Disbursement::Adding/Removing Elements",
              "position": 26
            },
            {
              "label": "Disbursement::Adding/Removing Sales Entities",
              "value": "Disbursement::Adding/Removing Sales Entities",
              "position": 27
            },
            {
              "label": "Disbursement::Deal Review",
              "value": "Disbursement::Deal Review",
              "position": 28
            },
            {
              "label": "Disbursement::Editing CDA",
              "value": "Disbursement::Editing CDA",
              "position": 29
            },
            {
              "label": "Disbursement::Required Fields Error",
              "value": "Disbursement::Required Fields Error",
              "position": 30
            },
            {
              "label": "Disbursement::Wrong Totals on Disbursement",
              "value": "Disbursement::Wrong Totals on Disbursement",
              "position": 31
            },
            {
              "label": "Documents::Agent Trade Sheet",
              "value": "Documents::Agent Trade Sheet",
              "position": 32
            },
            {
              "label": "Documents::Broker Trade Sheet",
              "value": "Documents::Broker Trade Sheet",
              "position": 33
            },
            {
              "label": "Documents::Disbursement Authorization",
              "value": "Documents::Disbursement Authorization",
              "position": 34
            },
            {
              "label": "Dual Deal::Creating a Dual Deal",
              "value": "Dual Deal::Creating a Dual Deal",
              "position": 35
            },
            {
              "label": "Dual Deal::Dual Deal Disbursement",
              "value": "Dual Deal::Dual Deal Disbursement",
              "position": 36
            },
            {
              "label": "Dual Deal::Linking/Unlinking Deals",
              "value": "Dual Deal::Linking/Unlinking Deals",
              "position": 37
            },
            {
              "label": "Incomplete (Draft) Deal",
              "value": "Incomplete (Draft) Deal",
              "position": 38
            },
            {
              "label": "Manage Escrow::Deposit Payments",
              "value": "Manage Escrow::Deposit Payments",
              "position": 39
            },
            {
              "label": "Manage Escrow::Deposit Releases",
              "value": "Manage Escrow::Deposit Releases",
              "position": 40
            },
            {
              "label": "Manage Escrow::Deposit Requests",
              "value": "Manage Escrow::Deposit Requests",
              "position": 41
            },
            {
              "label": "Manage Escrow::Unable to Delete Deposit",
              "value": "Manage Escrow::Unable to Delete Deposit",
              "position": 42
            },
            {
              "label": "Manage Parties::Can't Find Agent::Agent Added as External Vendor (Convert to Agent)",
              "value": "Manage Parties::Can't Find Agent::Agent Added as External Vendor (Convert to Agent)",
              "position": 43
            },
            {
              "label": "Manage Parties::Can't Find Agent > No User Profile",
              "value": "Manage Parties::Can't Find Agent > No User Profile",
              "position": 44
            },
            {
              "label": "Manage Parties::Add/Remove Agent",
              "value": "Manage Parties::Add/Remove Agent",
              "position": 45
            },
            {
              "label": "Manage Parties::Change Primary Agent",
              "value": "Manage Parties::Change Primary Agent",
              "position": 46
            },
            {
              "label": "Manage Parties::Error (Cannot Save Deal)",
              "value": "Manage Parties::Error (Cannot Save Deal)",
              "position": 47
            },
            {
              "label": "Manage Parties::% of Deal Split",
              "value": "Manage Parties::% of Deal Split",
              "position": 48
            },
            {
              "label": "Payouts::Closing",
              "value": "Payouts::Closing",
              "position": 49
            },
            {
              "label": "Payouts::Confirm Payment",
              "value": "Payouts::Confirm Payment",
              "position": 50
            },
            {
              "label": "Payouts::Incomplete/Stuck",
              "value": "Payouts::Incomplete/Stuck",
              "position": 51
            },
            {
              "label": "Payouts::Incorrect Payouts",
              "value": "Payouts::Incorrect Payouts",
              "position": 52
            },
            {
              "label": "Payouts::Post Date",
              "value": "Payouts::Post Date",
              "position": 53
            },
            {
              "label": "Payouts::Remaining",
              "value": "Payouts::Remaining",
              "position": 54
            },
            {
              "label": "Payouts::Revert Payout",
              "value": "Payouts::Revert Payout",
              "position": 55
            },
            {
              "label": "Processing Walkthrough",
              "value": "Processing Walkthrough",
              "position": 56
            },
            {
              "label": "Referral Deal Inquiry",
              "value": "Referral Deal Inquiry",
              "position": 57
            },
            {
              "label": "Required Field Hangup",
              "value": "Required Field Hangup",
              "position": 58
            },
            {
              "label": "Rules::Adding a Rule",
              "value": "Rules::Adding a Rule",
              "position": 59
            },
            {
              "label": "Rules::Cap Calculation Issue",
              "value": "Rules::Cap Calculation Issue",
              "position": 60
            },
            {
              "label": "Rules::Incorrect Rules Calculations",
              "value": "Rules::Incorrect Rules Calculations",
              "position": 61
            },
            {
              "label": "Rules::Prorate Issue",
              "value": "Rules::Prorate Issue",
              "position": 62
            },
            {
              "label": "SkySlope Menu::Disconnect",
              "value": "SkySlope Menu::Disconnect",
              "position": 63
            },
            {
              "label": "SkySlope Menu::Open SkySlope",
              "value": "SkySlope Menu::Open SkySlope",
              "position": 64
            },
            {
              "label": "SkySlope Menu::Refresh Data",
              "value": "SkySlope Menu::Refresh Data",
              "position": 65
            },
            {
              "label": "SkySlope Menu::Save Disbursement in SS",
              "value": "SkySlope Menu::Save Disbursement in SS",
              "position": 66
            },
            {
              "label": "SkySlope Menu::Save Trade Sheet in SS",
              "value": "SkySlope Menu::Save Trade Sheet in SS",
              "position": 67
            },
            {
              "label": "SkySlope Menu::View Details",
              "value": "SkySlope Menu::View Details",
              "position": 68
            },
            {
              "label": "Sync::Create SS/Dotloop Deal Manually",
              "value": "Sync::Create SS/Dotloop Deal Manually",
              "position": 69
            },
            {
              "label": "Sync::Deal Not Updating/Syncing Properly",
              "value": "Sync::Deal Not Updating/Syncing Properly",
              "position": 70
            },
            {
              "label": "Sync::Deal Stuck in Processing Queue",
              "value": "Sync::Deal Stuck in Processing Queue",
              "position": 71
            },
            {
              "label": "Trade Sheet::Error",
              "value": "Trade Sheet::Error",
              "position": 72
            },
            {
              "label": "Trade Sheet::Inquiry",
              "value": "Trade Sheet::Inquiry",
              "position": 73
            },
            {
              "label": "Update Deal Status",
              "value": "Update Deal Status",
              "position": 74
            },
            {
              "label": "View Deals (Agent)",
              "value": "View Deals (Agent)",
              "position": 75
            },
            {
              "label": "Deal Calculations::Commission is $0.00",
              "value": "Deal Calculations::Commission is $0.00",
              "position": 76
            },
            {
              "label": "Deal Calculations::Incorrect Agent Split",
              "value": "Deal Calculations::Incorrect Agent Split",
              "position": 77
            },
            {
              "label": "Deal Calculations::Incorrect Amount in DA",
              "value": "Deal Calculations::Incorrect Amount in DA",
              "position": 78
            },
            {
              "label": "Deal Calculations::Incorrect Transfer::Wrong Card",
              "value": "Deal Calculations::Incorrect Transfer::Wrong Card",
              "position": 79
            },
            {
              "label": "Deal Calculations::Incorrect Transfer::Wrong Receiver",
              "value": "Deal Calculations::Incorrect Transfer::Wrong Receiver",
              "position": 80
            },
            {
              "label": "Deal Calculations::Incorrect Transfer::Wrong Timing (Closing/Remaining)",
              "value": "Deal Calculations::Incorrect Transfer::Wrong Timing (Closing/Remaining)",
              "position": 81
            },
            {
              "label": "Disbursement::Unable To Get Correct Values",
              "value": "Disbursement::Unable To Get Correct Values",
              "position": 82
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 83
            }
          ]
        },
        {
          "label": "Directory",
          "value": "Directory",
          "position": 5,
          "choices": [
            {
              "label": "Contacts::Approvals Tab",
              "value": "Contacts::Approvals Tab",
              "position": 1
            },
            {
              "label": "Contacts::Compliance Tab::Anniversary Date",
              "value": "Contacts::Compliance Tab::Anniversary Date",
              "position": 2
            },
            {
              "label": "Contacts::Compliance Tab::Commission Modifiers::Create/Edit Modifier",
              "value": "Contacts::Compliance Tab::Commission Modifiers::Create/Edit Modifier",
              "position": 3
            },
            {
              "label": "Contacts::Compliance Tab::Commission Modifiers::Remove Modifier",
              "value": "Contacts::Compliance Tab::Commission Modifiers::Remove Modifier",
              "position": 4
            },
            {
              "label": "Contacts::Compliance Tab::Commission Modifiers::Walkthrough",
              "value": "Contacts::Compliance Tab::Commission Modifiers::Walkthrough",
              "position": 5
            },
            {
              "label": "Contacts::Compliance Tab::Compensation Attributes::Add/Remove Attribute",
              "value": "Contacts::Compliance Tab::Compensation Attributes::Add/Remove Attribute",
              "position": 6
            },
            {
              "label": "Contacts::Compliance Tab::Compensation Attributes::Create/Edit Attribute",
              "value": "Contacts::Compliance Tab::Compensation Attributes::Create/Edit Attribute",
              "position": 7
            },
            {
              "label": "Contacts::Compliance Tab::Compensation Attributes::Walkthrough",
              "value": "Contacts::Compliance Tab::Compensation Attributes::Walkthrough",
              "position": 8
            },
            {
              "label": "Contacts::Compliance Tab::Hire Date",
              "value": "Contacts::Compliance Tab::Hire Date",
              "position": 9
            },
            {
              "label": "Contacts::Compliance Tab::Licensing/Memberships",
              "value": "Contacts::Compliance Tab::Licensing/Memberships",
              "position": 10
            },
            {
              "label": "Contacts::Entering/Editing Contact",
              "value": "Contacts::Entering/Editing Contact",
              "position": 11
            },
            {
              "label": "Contacts::Locations Tab",
              "value": "Contacts::Locations Tab",
              "position": 12
            },
            {
              "label": "Contacts::Merge Contacts",
              "value": "Contacts::Merge Contacts",
              "position": 13
            },
            {
              "label": "Contacts::Payment Methods::Authorize.Net",
              "value": "Contacts::Payment Methods::Authorize.Net",
              "position": 14
            },
            {
              "label": "Contacts::Payment Methods::Payload.co",
              "value": "Contacts::Payment Methods::Payload.co",
              "position": 15
            },
            {
              "label": "Contacts::Payroll Tab::Add/Edit Tax Record",
              "value": "Contacts::Payroll Tab::Add/Edit Tax Record",
              "position": 16
            },
            {
              "label": "Contacts::Payroll Tab::Agent Disbursement Instructions",
              "value": "Contacts::Payroll Tab::Agent Disbursement Instructions",
              "position": 17
            },
            {
              "label": "Contacts::Records Upload",
              "value": "Contacts::Records Upload",
              "position": 18
            },
            {
              "label": "Contacts::Update Agent to LLC",
              "value": "Contacts::Update Agent to LLC",
              "position": 19
            },
            {
              "label": "User Profiles::Activate Profile::Connect Skyslope",
              "value": "User Profiles::Activate Profile::Connect Skyslope",
              "position": 20
            },
            {
              "label": "User Profiles::Activate Profile::Send Invite",
              "value": "User Profiles::Activate Profile::Send Invite",
              "position": 21
            },
            {
              "label": "User Profiles::Create Profile",
              "value": "User Profiles::Create Profile",
              "position": 22
            },
            {
              "label": "User Profiles::Edit Profile::Add/Remove from Division",
              "value": "User Profiles::Edit Profile::Add/Remove from Division",
              "position": 23
            },
            {
              "label": "User Profiles::Edit Profile::Add/Remove from Group",
              "value": "User Profiles::Edit Profile::Add/Remove from Group",
              "position": 24
            },
            {
              "label": "User Profiles::Edit Profile::Change User Information",
              "value": "User Profiles::Edit Profile::Change User Information",
              "position": 25
            },
            {
              "label": "User Profiles::Remove Duplicate Profile",
              "value": "User Profiles::Remove Duplicate Profile",
              "position": 26
            },
            {
              "label": "User Profiles::Revoke Access",
              "value": "User Profiles::Revoke Access",
              "position": 27
            },
            {
              "label": "User Profiles::My Business Portal",
              "value": "User Profiles::My Business Portal",
              "position": 28
            },
            {
              "label": "Groups::Other",
              "value": "Groups::Other",
              "position": 29
            },
            {
              "label": "Groups::Add/Remove Agents",
              "value": "Groups::Add/Remove Agents",
              "position": 30
            },
            {
              "label": "Groups::Create/Delete Group",
              "value": "Groups::Create/Delete Group",
              "position": 31
            },
            {
              "label": "Offices::Create/Delete Office",
              "value": "Offices::Create/Delete Office",
              "position": 32
            },
            {
              "label": "Offices::Other",
              "value": "Offices::Other",
              "position": 33
            }
          ]
        },
        {
          "label": "Elastic Search",
          "value": "Elastic Search",
          "position": 6,
          "choices": [
            {
              "label": "Error",
              "value": "Error",
              "position": 1
            },
            {
              "label": "Unable to Find Deal/Agent/Etc. in Search",
              "value": "Unable to Find Deal/Agent/Etc. in Search",
              "position": 2
            },
            {
              "label": "Using Elastic Search",
              "value": "Using Elastic Search",
              "position": 3
            }
          ]
        },
        {
          "label": "Integrations",
          "value": "Integrations",
          "position": 7,
          "choices": [
            {
              "label": "Authorize.net",
              "value": "Authorize.net",
              "position": 1
            },
            {
              "label": "Custom API Request",
              "value": "Custom API Request",
              "position": 2
            },
            {
              "label": "Google Looker Studio / Data Studio",
              "value": "Google Looker Studio / Data Studio",
              "position": 3
            },
            {
              "label": "QuickBooks",
              "value": "QuickBooks",
              "position": 4
            }
          ]
        },
        {
          "label": "Link Business",
          "value": "Link Business",
          "position": 8,
          "choices": [
            {
              "label": "Link Business Error",
              "value": "Link Business Error",
              "position": 1
            }
          ]
        },
        {
          "label": "New Edit Deal Page",
          "value": "New Edit Deal Page",
          "position": 9,
          "choices": [
            {
              "label": "Error (not replicated in Classic View)",
              "value": "Error (not replicated in Classic View)",
              "position": 1
            },
            {
              "label": "Feedback/Feature Suggestion",
              "value": "Feedback/Feature Suggestion",
              "position": 2
            },
            {
              "label": "Missing Function/Feature",
              "value": "Missing Function/Feature",
              "position": 3
            },
            {
              "label": "Walkthrough",
              "value": "Walkthrough",
              "position": 4
            }
          ]
        },
        {
          "label": "Notifications Menu Inquiry",
          "value": "Notifications Menu Inquiry",
          "position": 10,
          "choices": []
        },
        {
          "label": "Other",
          "value": "Other",
          "position": 11,
          "choices": [
            {
              "label": "Feature Request/Feedback",
              "value": "Feature Request/Feedback",
              "position": 1
            },
            {
              "label": "Internal Issue (Redirect to Brokerage)",
              "value": "Internal Issue (Redirect to Brokerage)",
              "position": 2
            },
            {
              "label": "Spam",
              "value": "Spam",
              "position": 3
            },
            {
              "label": "Tutorial/Training Request",
              "value": "Tutorial/Training Request",
              "position": 4
            },
            {
              "label": "User Resolved Own Issue",
              "value": "User Resolved Own Issue",
              "position": 5
            },
            {
              "label": "Wants Books",
              "value": "Wants Books",
              "position": 6
            },
            {
              "label": "Wrong Email (Not Relevant)",
              "value": "Wrong Email (Not Relevant)",
              "position": 7
            },
            {
              "label": "Demo/Testing Call",
              "value": "Demo/Testing Call",
              "position": 8
            },
            {
              "label": "Demo/Testing Chat",
              "value": "Demo/Testing Chat",
              "position": 9
            },
            {
              "label": "Demo/Testing Email",
              "value": "Demo/Testing Email",
              "position": 10
            }
          ]
        },
        {
          "label": "Purchases",
          "value": "Purchases",
          "position": 12,
          "choices": [
            {
              "label": "Bills::Agent View (Reference Documents)",
              "value": "Bills::Agent View (Reference Documents)",
              "position": 1
            },
            {
              "label": "Bills::Apply Credit",
              "value": "Bills::Apply Credit",
              "position": 2
            },
            {
              "label": "Bills::Create Bill",
              "value": "Bills::Create Bill",
              "position": 3
            },
            {
              "label": "Bills::Delete Bill",
              "value": "Bills::Delete Bill",
              "position": 4
            },
            {
              "label": "Bills::Edit Bill",
              "value": "Bills::Edit Bill",
              "position": 5
            },
            {
              "label": "Bills::Pay Bill",
              "value": "Bills::Pay Bill",
              "position": 6
            },
            {
              "label": "Bills::View Bill(s)",
              "value": "Bills::View Bill(s)",
              "position": 7
            },
            {
              "label": "Bills::Void Bill",
              "value": "Bills::Void Bill",
              "position": 8
            },
            {
              "label": "Payments Made::Check Payment",
              "value": "Payments Made::Check Payment",
              "position": 9
            },
            {
              "label": "Payments Made::Delete Payment",
              "value": "Payments Made::Delete Payment",
              "position": 10
            },
            {
              "label": "Payments Made::Edit Payment",
              "value": "Payments Made::Edit Payment",
              "position": 11
            },
            {
              "label": "Payments Made::Find Payment",
              "value": "Payments Made::Find Payment",
              "position": 12
            },
            {
              "label": "Payments Made::Print Check",
              "value": "Payments Made::Print Check",
              "position": 13
            },
            {
              "label": "Payments Made::Print Paystub",
              "value": "Payments Made::Print Paystub",
              "position": 14
            },
            {
              "label": "Payments Made::Revert Payment",
              "value": "Payments Made::Revert Payment",
              "position": 15
            },
            {
              "label": "Payments Made::Uncleared Check",
              "value": "Payments Made::Uncleared Check",
              "position": 16
            },
            {
              "label": "Recurring Bills::Create Recurring Bill",
              "value": "Recurring Bills::Create Recurring Bill",
              "position": 17
            },
            {
              "label": "Recurring Bills::Edit Recurring Bill",
              "value": "Recurring Bills::Edit Recurring Bill",
              "position": 18
            },
            {
              "label": "Recurring Bills::Error in Recurring Bill",
              "value": "Recurring Bills::Error in Recurring Bill",
              "position": 19
            },
            {
              "label": "Recurring Bills::Recurring Bill Issue",
              "value": "Recurring Bills::Recurring Bill Issue",
              "position": 20
            },
            {
              "label": "Recurring Bills::Recurring Bill Not Working",
              "value": "Recurring Bills::Recurring Bill Not Working",
              "position": 21
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 22
            },
            {
              "label": "Vendor Credit::Apply Credit",
              "value": "Vendor Credit::Apply Credit",
              "position": 23
            },
            {
              "label": "Vendor Credit::Create/Void Credit",
              "value": "Vendor Credit::Create/Void Credit",
              "position": 24
            },
            {
              "label": "Vendor Credit::Other",
              "value": "Vendor Credit::Other",
              "position": 25
            },
            {
              "label": "Vendor Credit::Source Documents",
              "value": "Vendor Credit::Source Documents",
              "position": 26
            }
          ]
        },
        {
          "label": "Reporting",
          "value": "Reporting",
          "position": 13,
          "choices": [
            {
              "label": "Agent Reporting",
              "value": "Agent Reporting",
              "position": 1
            },
            {
              "label": "Dashboard::Cap Tracking",
              "value": "Dashboard::Cap Tracking",
              "position": 2
            },
            {
              "label": "Dashboard::Dashboard Walkthrough/Overview",
              "value": "Dashboard::Dashboard Walkthrough/Overview",
              "position": 3
            },
            {
              "label": "Deal Reports::Agent Performance",
              "value": "Deal Reports::Agent Performance",
              "position": 4
            },
            {
              "label": "Deal Reports::Average Sales",
              "value": "Deal Reports::Average Sales",
              "position": 5
            },
            {
              "label": "Deal Reports::Commission Expense",
              "value": "Deal Reports::Commission Expense",
              "position": 6
            },
            {
              "label": "Deal Reports::Detailed Transactions",
              "value": "Deal Reports::Detailed Transactions",
              "position": 7
            },
            {
              "label": "Deal Reports::Source of Business",
              "value": "Deal Reports::Source of Business",
              "position": 8
            },
            {
              "label": "Deal Reports::Summary Transactions",
              "value": "Deal Reports::Summary Transactions",
              "position": 9
            },
            {
              "label": "Financial Reports::1099 Reports",
              "value": "Financial Reports::1099 Reports",
              "position": 10
            },
            {
              "label": "Financial Reports::Accounting Trial Balance",
              "value": "Financial Reports::Accounting Trial Balance",
              "position": 11
            },
            {
              "label": "Financial Reports::Account Transactions",
              "value": "Financial Reports::Account Transactions",
              "position": 12
            },
            {
              "label": "Financial Reports::Account Type Summary",
              "value": "Financial Reports::Account Type Summary",
              "position": 13
            },
            {
              "label": "Financial Reports::Aging Reports",
              "value": "Financial Reports::Aging Reports",
              "position": 14
            },
            {
              "label": "Financial Reports::Balance Sheet",
              "value": "Financial Reports::Balance Sheet",
              "position": 15
            },
            {
              "label": "Financial Reports::Cash Flow Statement",
              "value": "Financial Reports::Cash Flow Statement",
              "position": 16
            },
            {
              "label": "Financial Reports::General Ledger",
              "value": "Financial Reports::General Ledger",
              "position": 17
            },
            {
              "label": "Financial Reports::Income Statement",
              "value": "Financial Reports::Income Statement",
              "position": 18
            },
            {
              "label": "Financial Reports::Journal",
              "value": "Financial Reports::Journal",
              "position": 19
            },
            {
              "label": "Financial Reports::Recurring Invoice",
              "value": "Financial Reports::Recurring Invoice",
              "position": 20
            },
            {
              "label": "Financial Reports::Summary Trial Balance",
              "value": "Financial Reports::Summary Trial Balance",
              "position": 21
            },
            {
              "label": "Financial Reports::Trust Reconciliation",
              "value": "Financial Reports::Trust Reconciliation",
              "position": 22
            },
            {
              "label": "General Reports::Contact",
              "value": "General Reports::Contact",
              "position": 23
            },
            {
              "label": "General Reports::Membership",
              "value": "General Reports::Membership",
              "position": 24
            },
            {
              "label": "General Reports::Product",
              "value": "General Reports::Product",
              "position": 25
            },
            {
              "label": "General Reports::Progress Reports",
              "value": "General Reports::Progress Reports",
              "position": 26
            },
            {
              "label": "General Reports::Summary Cap",
              "value": "General Reports::Summary Cap",
              "position": 27
            },
            {
              "label": "Report Walkthrough",
              "value": "Report Walkthrough",
              "position": 28
            }
          ]
        },
        {
          "label": "Sales",
          "value": "Sales",
          "position": 14,
          "choices": [
            {
              "label": "Invoices::Agent View (Reference Documents)",
              "value": "Invoices::Agent View (Reference Documents)",
              "position": 1
            },
            {
              "label": "Invoices::Apply Credit",
              "value": "Invoices::Apply Credit",
              "position": 2
            },
            {
              "label": "Invoices::Charge Customer (Credit Card)",
              "value": "Invoices::Charge Customer (Credit Card)",
              "position": 3
            },
            {
              "label": "Invoices::Deduct From Deal",
              "value": "Invoices::Deduct From Deal",
              "position": 4
            },
            {
              "label": "Invoices::Delete Invoice",
              "value": "Invoices::Delete Invoice",
              "position": 5
            },
            {
              "label": "Invoices::Edit Invoice",
              "value": "Invoices::Edit Invoice",
              "position": 6
            },
            {
              "label": "Invoices::Pay Invoice (Agent)",
              "value": "Invoices::Pay Invoice (Agent)",
              "position": 7
            },
            {
              "label": "Invoices::Recurring Invoices::Accepted Form of Payment",
              "value": "Invoices::Recurring Invoices::Accepted Form of Payment",
              "position": 8
            },
            {
              "label": "Invoices::Recurring Invoices::Auto-Charge Settings",
              "value": "Invoices::Recurring Invoices::Auto-Charge Settings",
              "position": 9
            },
            {
              "label": "Invoices::Recurring Invoices::Edit/Delete Recurring Invoice",
              "value": "Invoices::Recurring Invoices::Edit/Delete Recurring Invoice",
              "position": 10
            },
            {
              "label": "Invoices::Recurring Invoices::Error (Other)",
              "value": "Invoices::Recurring Invoices::Error (Other)",
              "position": 11
            },
            {
              "label": "Invoices::Recurring Invoices::Invoice Not Generating",
              "value": "Invoices::Recurring Invoices::Invoice Not Generating",
              "position": 12
            },
            {
              "label": "Invoices::Recurring Invoices::Unable to Create Recurring Invoice",
              "value": "Invoices::Recurring Invoices::Unable to Create Recurring Invoice",
              "position": 13
            },
            {
              "label": "Invoices::Remove Payment",
              "value": "Invoices::Remove Payment",
              "position": 14
            },
            {
              "label": "Invoices::Send/Resend Invoice",
              "value": "Invoices::Send/Resend Invoice",
              "position": 15
            },
            {
              "label": "Invoice Statements",
              "value": "Invoice Statements",
              "position": 16
            },
            {
              "label": "Credit Notes::Apply Note",
              "value": "Credit Notes::Apply Note",
              "position": 17
            },
            {
              "label": "Credit Notes::Create/Void Note",
              "value": "Credit Notes::Create/Void Note",
              "position": 18
            },
            {
              "label": "Credit Notes::Create Recurring Note",
              "value": "Credit Notes::Create Recurring Note",
              "position": 19
            },
            {
              "label": "Credit Notes::Other",
              "value": "Credit Notes::Other",
              "position": 20
            },
            {
              "label": "Credit Notes::Source Documents",
              "value": "Credit Notes::Source Documents",
              "position": 21
            },
            {
              "label": "Invoices::Associate Invoice",
              "value": "Invoices::Associate Invoice",
              "position": 22
            },
            {
              "label": "Invoices::Connect Invoice",
              "value": "Invoices::Connect Invoice",
              "position": 23
            },
            {
              "label": "Invoices::Create/Void Invoice",
              "value": "Invoices::Create/Void Invoice",
              "position": 24
            },
            {
              "label": "Invoices::Create Recurring Invoice",
              "value": "Invoices::Create Recurring Invoice",
              "position": 25
            },
            {
              "label": "Invoices::Disconnect Invoice",
              "value": "Invoices::Disconnect Invoice",
              "position": 26
            },
            {
              "label": "Invoices::Other",
              "value": "Invoices::Other",
              "position": 27
            },
            {
              "label": "Invoices::Source Documents",
              "value": "Invoices::Source Documents",
              "position": 28
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 29
            }
          ]
        },
        {
          "label": "SkySlope",
          "value": "SkySlope",
          "position": 15,
          "choices": [
            {
              "label": "Connect User Account",
              "value": "Connect User Account",
              "position": 1
            },
            {
              "label": "Auto Create Not Working",
              "value": "Auto Create Not Working",
              "position": 2
            },
            {
              "label": "Cannot Find Deal",
              "value": "Cannot Find Deal",
              "position": 3
            },
            {
              "label": "Cannot Pull Deal",
              "value": "Cannot Pull Deal",
              "position": 4
            },
            {
              "label": "Deal Not Updating",
              "value": "Deal Not Updating",
              "position": 5
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 6
            }
          ]
        },
        {
          "label": "Syswide",
          "value": "Syswide",
          "position": 16,
          "choices": [
            {
              "label": "Other",
              "value": "Other",
              "position": 1
            }
          ]
        },
        {
          "label": "SysWide",
          "value": "SysWide",
          "position": 17,
          "choices": [
            {
              "label": "Site Outage",
              "value": "Site Outage",
              "position": 1
            },
            {
              "label": "Slowness",
              "value": "Slowness",
              "position": 2
            }
          ]
        },
        {
          "label": "Company",
          "value": "Company",
          "position": 18,
          "choices": [
            {
              "label": "Directory::Roles::Assign Role",
              "value": "Directory::Roles::Assign Role",
              "position": 1
            },
            {
              "label": "Directory::Roles::Create/Delete Role",
              "value": "Directory::Roles::Create/Delete Role",
              "position": 2
            },
            {
              "label": "Directory::Roles::Edit Role",
              "value": "Directory::Roles::Edit Role",
              "position": 3
            },
            {
              "label": "Directory::Roles::Other",
              "value": "Directory::Roles::Other",
              "position": 4
            },
            {
              "label": "Finance::Chart of Accounts::Create/Delete Ledger Account",
              "value": "Finance::Chart of Accounts::Create/Delete Ledger Account",
              "position": 5
            },
            {
              "label": "Finance::Chart of Accounts::Edit Ledger Account",
              "value": "Finance::Chart of Accounts::Edit Ledger Account",
              "position": 6
            },
            {
              "label": "Finance::Chart of Accounts::Other",
              "value": "Finance::Chart of Accounts::Other",
              "position": 7
            },
            {
              "label": "Finance::Data::Export::Journal Entries",
              "value": "Finance::Data::Export::Journal Entries",
              "position": 8
            },
            {
              "label": "Finance::Data::Export::Other",
              "value": "Finance::Data::Export::Other",
              "position": 9
            },
            {
              "label": "Finance::Data::Export::Products/Services",
              "value": "Finance::Data::Export::Products/Services",
              "position": 10
            },
            {
              "label": "Finance::Data::Export::Profiles",
              "value": "Finance::Data::Export::Profiles",
              "position": 11
            },
            {
              "label": "Finance::Data::Import::Chart of Accounts",
              "value": "Finance::Data::Import::Chart of Accounts",
              "position": 12
            },
            {
              "label": "Finance::Data::Import::Contacts",
              "value": "Finance::Data::Import::Contacts",
              "position": 13
            },
            {
              "label": "Finance::Data::Import::Deals",
              "value": "Finance::Data::Import::Deals",
              "position": 14
            },
            {
              "label": "Finance::Data::Import::Invoices",
              "value": "Finance::Data::Import::Invoices",
              "position": 15
            },
            {
              "label": "Finance::Data::Import::Other",
              "value": "Finance::Data::Import::Other",
              "position": 16
            },
            {
              "label": "Finance::Data::Import::Profile",
              "value": "Finance::Data::Import::Profile",
              "position": 17
            },
            {
              "label": "Finance::Data::Other",
              "value": "Finance::Data::Other",
              "position": 18
            },
            {
              "label": "Finance::Journal::Create/Delete Entry",
              "value": "Finance::Journal::Create/Delete Entry",
              "position": 19
            },
            {
              "label": "Finance::Journal::Edit Service/Product",
              "value": "Finance::Journal::Edit Service/Product",
              "position": 20
            },
            {
              "label": "Finance::Journal::Other",
              "value": "Finance::Journal::Other",
              "position": 21
            },
            {
              "label": "Finance::Opening Balances::Entering/Updating Balance",
              "value": "Finance::Opening Balances::Entering/Updating Balance",
              "position": 22
            },
            {
              "label": "Finance::Opening Balances::Other",
              "value": "Finance::Opening Balances::Other",
              "position": 23
            },
            {
              "label": "Finance::Other",
              "value": "Finance::Other",
              "position": 24
            },
            {
              "label": "Finance::Services/Products::Create/Delete Service/Product",
              "value": "Finance::Services/Products::Create/Delete Service/Product",
              "position": 25
            },
            {
              "label": "Finance::Services/Products::Edit Service/Product",
              "value": "Finance::Services/Products::Edit Service/Product",
              "position": 26
            },
            {
              "label": "Finance::Services/Products::Other",
              "value": "Finance::Services/Products::Other",
              "position": 27
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 28
            }
          ]
        },
        {
          "label": "Dotloop",
          "value": "Dotloop",
          "position": 19,
          "choices": [
            {
              "label": "Auto Create Not Working",
              "value": "Auto Create Not Working",
              "position": 1
            },
            {
              "label": "Cannot Find Deal",
              "value": "Cannot Find Deal",
              "position": 2
            },
            {
              "label": "Cannot Pull Deal",
              "value": "Cannot Pull Deal",
              "position": 3
            },
            {
              "label": "Deal Not Updating",
              "value": "Deal Not Updating",
              "position": 4
            }
          ]
        },
        {
          "label": "Lending",
          "value": "Lending",
          "position": 20,
          "choices": [
            {
              "label": "Advances::Create/Delete Advance",
              "value": "Advances::Create/Delete Advance",
              "position": 1
            },
            {
              "label": "Advances::Other",
              "value": "Advances::Other",
              "position": 2
            },
            {
              "label": "Garnishments::Create/Delete Garnishment",
              "value": "Garnishments::Create/Delete Garnishment",
              "position": 3
            },
            {
              "label": "Garnishments::Other",
              "value": "Garnishments::Other",
              "position": 4
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 5
            }
          ]
        },
        {
          "label": "Settings",
          "value": "Settings",
          "position": 21,
          "choices": [
            {
              "label": "Enter/Update Company Address",
              "value": "Enter/Update Company Address",
              "position": 1
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 2
            },
            {
              "label": "Update Billing Address",
              "value": "Update Billing Address",
              "position": 3
            },
            {
              "label": "Update Default Disbursement Address",
              "value": "Update Default Disbursement Address",
              "position": 4
            },
            {
              "label": "Update Payroll Address",
              "value": "Update Payroll Address",
              "position": 5
            }
          ]
        },
        {
          "label": "Muhnee",
          "value": "Muhnee",
          "position": 22,
          "choices": [
            {
              "label": "Bank Connection",
              "value": "Bank Connection",
              "position": 1
            },
            {
              "label": "Bank Verification",
              "value": "Bank Verification",
              "position": 2
            },
            {
              "label": "KYC/KYB Approvals",
              "value": "KYC/KYB Approvals",
              "position": 3
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 4
            },
            {
              "label": "Legacy Zoho Tickets",
              "value": "Legacy Zoho Tickets",
              "position": 5
            }
          ]
        },
        {
          "label": "Legacy Zoho Tickets",
          "value": "Legacy Zoho Tickets",
          "position": 23,
          "choices": []
        }
      ]
    },
    {
      "label": "Cyberco",
      "value": "Cyberco",
      "position": 2,
      "choices": [
        {
          "label": "Direct to Cyberco Support",
          "value": "Direct to Cyberco Support",
          "position": 1,
          "choices": []
        }
      ]
    },
    {
      "label": "Payload",
      "value": "Payload",
      "position": 3,
      "choices": [
        {
          "label": "Account Closed/Invalid Error",
          "value": "Account Closed/Invalid Error",
          "position": 1,
          "choices": []
        },
        {
          "label": "Account Info",
          "value": "Account Info",
          "position": 2,
          "choices": [
            {
              "label": "Connect Bank",
              "value": "Connect Bank",
              "position": 1
            }
          ]
        },
        {
          "label": "Add Account",
          "value": "Add Account",
          "position": 3,
          "choices": [
            {
              "label": "Trust Account",
              "value": "Trust Account",
              "position": 1
            }
          ]
        },
        {
          "label": "Cancel Payment",
          "value": "Cancel Payment",
          "position": 4,
          "choices": []
        },
        {
          "label": "Convenience/Service Fee Inquiry",
          "value": "Convenience/Service Fee Inquiry",
          "position": 5,
          "choices": []
        },
        {
          "label": "Delayed Transfer",
          "value": "Delayed Transfer",
          "position": 6,
          "choices": []
        },
        {
          "label": "Disconnect Account",
          "value": "Disconnect Account",
          "position": 7,
          "choices": []
        },
        {
          "label": "Failed Transfer",
          "value": "Failed Transfer",
          "position": 8,
          "choices": []
        },
        {
          "label": "Notification Email",
          "value": "Notification Email",
          "position": 9,
          "choices": []
        },
        {
          "label": "Payload Issue (Direct to Payload Support)",
          "value": "Payload Issue (Direct to Payload Support)",
          "position": 10,
          "choices": []
        },
        {
          "label": "Processing Timeline",
          "value": "Processing Timeline",
          "position": 11,
          "choices": []
        },
        {
          "label": "Setup/Walkthrough",
          "value": "Setup/Walkthrough",
          "position": 12,
          "choices": [
            {
              "label": "Agent Banking Info",
              "value": "Agent Banking Info",
              "position": 1
            },
            {
              "label": "Onboarding",
              "value": "Onboarding",
              "position": 2
            }
          ]
        }
      ]
    },
    {
      "label": "SkySlope",
      "value": "SkySlope",
      "position": 4,
      "choices": [
        {
          "label": "Apps Menu",
          "value": "Apps Menu",
          "position": 1,
          "choices": []
        },
        {
          "label": "Suite Support (Referred to SS Support)",
          "value": "Suite Support (Referred to SS Support)",
          "position": 2,
          "choices": []
        },
        {
          "label": "Wants SkySlope",
          "value": "Wants SkySlope",
          "position": 3,
          "choices": []
        }
      ]
    },
    {
      "label": "User Machine",
      "value": "User Machine",
      "position": 5,
      "choices": [
        {
          "label": "Browser Issue",
          "value": "Browser Issue",
          "position": 1,
          "choices": [
            {
              "label": "Chrome",
              "value": "Chrome",
              "position": 1
            },
            {
              "label": "Edge",
              "value": "Edge",
              "position": 2
            },
            {
              "label": "Firefox",
              "value": "Firefox",
              "position": 3
            },
            {
              "label": "Opera",
              "value": "Opera",
              "position": 4
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 5
            },
            {
              "label": "Refresh Page",
              "value": "Refresh Page",
              "position": 6
            },
            {
              "label": "Safari",
              "value": "Safari",
              "position": 7
            }
          ]
        },
        {
          "label": "Clear Cache & Cookies",
          "value": "Clear Cache & Cookies",
          "position": 2,
          "choices": []
        },
        {
          "label": "OS Issue",
          "value": "OS Issue",
          "position": 3,
          "choices": [
            {
              "label": "ChromeOS",
              "value": "ChromeOS",
              "position": 1
            },
            {
              "label": "MacOS",
              "value": "MacOS",
              "position": 2
            },
            {
              "label": "Other",
              "value": "Other",
              "position": 3
            },
            {
              "label": "Windows",
              "value": "Windows",
              "position": 4
            }
          ]
        },
        {
          "label": "Printing",
          "value": "Printing",
          "position": 4,
          "choices": [
            {
              "label": "MacOS Auto-Redact",
              "value": "MacOS Auto-Redact",
              "position": 1
            },
            {
              "label": "Printing Error",
              "value": "Printing Error",
              "position": 2
            }
          ]
        },
        {
          "label": "Slow Internet Connection",
          "value": "Slow Internet Connection",
          "position": 5,
          "choices": []
        },
        {
          "label": "User Machine Issue",
          "value": "User Machine Issue",
          "position": 6,
          "choices": []
        }
      ]
    }
  ],
  "dependent_fields": [
    {
      "label": "Root Issue",
      "label_for_customers": "Root Issue",
      "level": 2
    },
    {
      "label": "Sub Issue",
      "label_for_customers": "Sub Issue",
      "level": 3
    }
  ]
}
