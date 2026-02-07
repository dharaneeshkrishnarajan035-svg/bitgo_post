require("dotenv").config();
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const fs = require('fs')
const {
  updateDestinationId,
  updateCount,
  fetchParticularRow,
  insertUpdateData,
  insertIntoDynamoDB
} = require("../Functions/dynamoFunctions");

const { formatRequesterPayload } = require("../Utils/Requesters/formatRequester");
const { createRequester } = require("../Utils/Requesters/createRequester");
const { writeLog, getSalesforceAccessToken, fetchSalesforceData } = require('../Functions/commonFunctions');
const { getValidAccessToken } = require("../Utils/getAccessToken");

const REQUESTER_TABLE = process.env.AWS_SOURCE_USERS_TABLE;
const AGENT_TABLE = process.env.AWS_SOURCE_AGENTS_TABLE;
const PROJECT_DIRECTORY = process.env.PROJECT_PATH;
const DEFAULT_REQUESTER_ID = process.env.DEFAULT_REQUESTER_ID;

const OVERALL_LOG = process.env.REQUESTER_OVERALL_LOG;
const ERROR_LOG = process.env.REQUESTER_ERROR_LOG;
const REQUESTER_NOT_CREATED_LOG = process.env.REQUESTER_NOT_CREATED_LOG;
const REQUESTER_CREATED_LOG = process.env.REQUESTER_CREATED_LOG;
const moduleId = 4;

let totalSuccess = 0;
let totalFailure = 0;

const requesterIdKey = "Id";
const requesterNameKey = "Name"

async function requesterMigration(singleUserId = null) {
  try {
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')

    console.log("Requester Migration Started...");
    writeLog(OVERALL_LOG, `Requester Migration Started...`);
    writeLog(ERROR_LOG, `Requester Migration Started...`);

    // Step 2: Parse the JSON string into a JavaScript array or object
    let userIds = [];

    if (singleUserId) {
      userIds = [singleUserId];
    } else {
      const userIdData = await fs.promises.readFile(process.env.REQUESTER_ID_FILE, 'utf-8');
      userIds = (JSON.parse(userIdData) ?? [])//.slice(0, 1);
    }

    writeLog(OVERALL_LOG, `Total Requesters to Migrate : ${userIds.length}`);
    writeLog(ERROR_LOG, `Total Requesters to Migrate : ${userIds.length}`);

    const migrateOne = async (userId) => {
      let result = { success: 0, failure: 0, sourceId: userId, destinationId: null };

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');

      //Fetch User DynamoDB Data
      let rawUserData = await fetchParticularRow(
        REQUESTER_TABLE,
        "sourceId",
        userId,
        sortKey = null,
        sortValue = null,
        OVERALL_LOG,
        ERROR_LOG
      );

      let userData = {};
      if (rawUserData) {
        userData = rawUserData // unmarshall(rawUserData);
        // userData.sourceData = JSON.parse(userData?.sourceData);
      } else {
        rawUserData = await fetchParticularRow(
          AGENT_TABLE,
          "sourceId",
          userId,
          sortKey = null,
          sortValue = null,
          OVERALL_LOG,
          ERROR_LOG
        );

        if (rawUserData) {
          userData = rawUserData
        } else {
          const sourceId = userId;
          const destinationId = null;
          const { accessToken, instanceUrl } = await getSalesforceAccessToken();

          if (!accessToken) {
            console.log(`GET ACCESS TOKEN IS FAILED!!`);
            return;
          }

          const query = `Select Id, IsDeleted, MasterRecordId, AccountId, LastName, FirstName, Salutation, MiddleName, Suffix, Name, OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry, OtherLatitude, OtherLongitude, OtherGeocodeAccuracy, OtherAddress, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, MailingLatitude, MailingLongitude, MailingGeocodeAccuracy, MailingAddress, Phone, Fax, MobilePhone, HomePhone, OtherPhone, AssistantPhone, ReportsToId, Email, Title, Department, AssistantName, LeadSource, Birthdate, Description, CurrencyIsoCode, OwnerId, HasOptedOutOfEmail, HasOptedOutOfFax, DoNotCall, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, LastActivityDate, LastCURequestDate, LastCUUpdateDate, LastViewedDate, LastReferencedDate, EmailBouncedReason, EmailBouncedDate, IsEmailBounced, PhotoUrl, Jigsaw, JigsawContactId, IndividualId, FirstCallDateTime, FirstEmailDateTime, ActivityMetricId, IsPriorityRecord, ContactSource, Pipedrive_Person_ID__c, Notification_Campaign__c, Lead_Sales_Country__c, mkto71_Lead_Score__c, mkto71_Acquisition_Date__c, mkto71_Acquisition_Program__c, mkto71_Acquisition_Program_Id__c, mkto71_Original_Referrer__c, mkto71_Original_Search_Engine__c, mkto71_Original_Search_Phrase__c, mkto71_Original_Source_Info__c, mkto71_Original_Source_Type__c, mkto71_Inferred_City__c, mkto71_Inferred_Company__c, mkto71_Inferred_Country__c, mkto71_Inferred_Metropolitan_Area__c, mkto71_Inferred_Phone_Area_Code__c, mkto71_Inferred_Postal_Code__c, mkto71_Inferred_State_Region__c, Communication_Opt_Out__c, Conversion_Point__c, LinkedIn__c, PD_Account_ID__c, Email_Address_2__c, Email_Address_3__c, engagio__Department__c, engagio__EngagementMinutesLast30Days__c, engagio__EngagementMinutesLast3Months__c, engagio__EngagementMinutesLast7Days__c, engagio__FirstEngagementDate__c, engagio__IntentMinutesLast30Days__c, engagio__Role__c, engagio__Sales_Touches_14_days__c, engagio__Sales_Touches_7_days__c, Contact_Domain__c, Conversion_Point_Details__c, Enrichment__c, utm_source__c, utm_term__c, utm_medium__c, Demographic_Score__c, Behavior_Score__c, Contact_Status__c, utm_content__c, utm_campaign__c, rh2__Currency_Test__c, rh2__Describe__c, rh2__Integer_Test__c, rh2__Formula_Test__c, fbclid__c, twclid__c, lifatid__c, gclid__c, DOZISF__ZoomInfo_Company_ID__c, DOZISF__ZoomInfo_Enrich_Status__c, DOZISF__ZoomInfo_First_Updated__c, DOZISF__ZoomInfo_Id__c, Spoke_with_at_Tradeshow__c, Lead_Sales_Region__c, Contact_Role__c, Account_Status__c, Do_Not_Contact__c, Person_Stage__c, No_Longer_With_The_Company__c, DOZISF__ZoomInfo_InboxAI_ID__c, DOZISF__ZoomInfo_Last_Updated__c, DOZISF__ZoomInfo_Non_Matched_Reason__c, SalesLoft1__Active_Contact__c, SalesLoft1__Most_Recent_Cadence_Name__c, SalesLoft1__Most_Recent_Cadence_Next_Step_Due_Date__c, SalesLoft1__Most_Recent_Last_Completed_Step__c, DOZISF__ZoomInfo_Opsos_App_Field__c, HubSpot_Original_Source__c, HubSpot_Original_Source_Drill_Down_1__c, HubSpot_Original_Source_Drill_Down_2__c, DOZISF__ZoomInfo_Opsos_Current_Endpoint__c, DOZISF__ZoomInfo_Opsos_Last_Processed_Date__c, Opt_Out_of_Marketing_Comms__c, ACCOUNT_NAME_MULESOFT__c, Account_Netsuite_ID_MULESOFT__c, Sync_With_Netsuite__c, Send_NPS_Survey__c, Telegram__c FROM Contact WHERE Id='${userId}'`

          const encodedQuery = encodeURIComponent(query);
          let nextUrl = `/services/data/v64.0/query?q=${encodedQuery}`;
          const url = `${instanceUrl}${nextUrl}`;

          const rawData = await fetchSalesforceData(url, accessToken, OVERALL_LOG, ERROR_LOG);
          let data = rawData?.records;

          if (data.length > 0) {
            await insertIntoDynamoDB(process.env.AWS_SOURCE_USERS_TABLE, data[0], "Requester", OVERALL_LOG, ERROR_LOG);
          } else {
            const agentQuery = `SELECT Id, Username, LastName, FirstName, MiddleName, Suffix, Name, CompanyName, Division, Department, Title, Street, City, State, PostalCode, Country, Latitude, Longitude, GeocodeAccuracy, Address, Email, EmailPreferencesAutoBcc, EmailPreferencesAutoBccStayInTouch, EmailPreferencesStayInTouchReminder, SenderEmail, SenderName, Signature, StayInTouchSubject, StayInTouchSignature, StayInTouchNote, Phone, Fax, MobilePhone, Alias, CommunityNickname, BadgeText, IsActive, TimeZoneSidKey, UserRoleId, LocaleSidKey, ReceivesInfoEmails, ReceivesAdminInfoEmails, EmailEncodingKey, DefaultCurrencyIsoCode, CurrencyIsoCode, ProfileId, UserType, StartDay, EndDay, LanguageLocaleKey, EmployeeNumber, DelegatedApproverId, ManagerId, LastLoginDate, LastPasswordChangeDate, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, PasswordExpirationDate, NumberOfFailedLogins, SuAccessExpirationDate, OfflineTrialExpirationDate, OfflinePdaTrialExpirationDate, UserPermissionsMarketingUser, UserPermissionsOfflineUser, UserPermissionsAvantgoUser, UserPermissionsCallCenterAutoLogin, UserPermissionsSFContentUser, UserPermissionsKnowledgeUser, UserPermissionsInteractionUser, UserPermissionsSupportUser, ForecastEnabled, UserPreferencesActivityRemindersPopup, UserPreferencesEventRemindersCheckboxDefault, UserPreferencesTaskRemindersCheckboxDefault, UserPreferencesReminderSoundOff, UserPreferencesDisableAllFeedsEmail, UserPreferencesDisableFollowersEmail, UserPreferencesDisableProfilePostEmail, UserPreferencesDisableChangeCommentEmail, UserPreferencesDisableLaterCommentEmail, UserPreferencesDisProfPostCommentEmail, UserPreferencesApexPagesDeveloperMode, UserPreferencesReceiveNoNotificationsAsApprover, UserPreferencesReceiveNotificationsAsDelegatedApprover, UserPreferencesHideCSNGetChatterMobileTask, UserPreferencesDisableMentionsPostEmail, UserPreferencesDisMentionsCommentEmail, UserPreferencesHideCSNDesktopTask, UserPreferencesHideChatterOnboardingSplash, UserPreferencesHideSecondChatterOnboardingSplash, UserPreferencesDisCommentAfterLikeEmail, UserPreferencesDisableLikeEmail, UserPreferencesSortFeedByComment, UserPreferencesDisableMessageEmail, UserPreferencesDisableBookmarkEmail, UserPreferencesAllowConversationReminders, UserPreferencesDisableSharePostEmail, UserPreferencesActionLauncherEinsteinGptConsent, UserPreferencesAssistiveActionsEnabledInActionLauncher, UserPreferencesEnableAutoSubForFeeds, UserPreferencesDisableFileShareNotificationsForApi, UserPreferencesShowTitleToExternalUsers, UserPreferencesShowManagerToExternalUsers, UserPreferencesShowEmailToExternalUsers, UserPreferencesShowWorkPhoneToExternalUsers, UserPreferencesShowMobilePhoneToExternalUsers, UserPreferencesShowFaxToExternalUsers, UserPreferencesShowStreetAddressToExternalUsers, UserPreferencesShowCityToExternalUsers, UserPreferencesShowStateToExternalUsers, UserPreferencesShowPostalCodeToExternalUsers, UserPreferencesShowCountryToExternalUsers, UserPreferencesShowProfilePicToGuestUsers, UserPreferencesShowTitleToGuestUsers, UserPreferencesShowCityToGuestUsers, UserPreferencesShowStateToGuestUsers, UserPreferencesShowPostalCodeToGuestUsers, UserPreferencesShowCountryToGuestUsers, UserPreferencesShowForecastingChangeSignals, UserPreferencesLiveAgentMiawSetupDeflection, UserPreferencesHideS1BrowserUI, UserPreferencesDisableEndorsementEmail, UserPreferencesPathAssistantCollapsed, UserPreferencesCacheDiagnostics, UserPreferencesShowEmailToGuestUsers, UserPreferencesShowManagerToGuestUsers, UserPreferencesShowWorkPhoneToGuestUsers, UserPreferencesShowMobilePhoneToGuestUsers, UserPreferencesShowFaxToGuestUsers, UserPreferencesShowStreetAddressToGuestUsers, UserPreferencesLightningExperiencePreferred, UserPreferencesPreviewLightning, UserPreferencesHideEndUserOnboardingAssistantModal, UserPreferencesHideLightningMigrationModal, UserPreferencesHideSfxWelcomeMat, UserPreferencesHideBiggerPhotoCallout, UserPreferencesGlobalNavBarWTShown, UserPreferencesGlobalNavGridMenuWTShown, UserPreferencesCreateLEXAppsWTShown, UserPreferencesFavoritesWTShown, UserPreferencesRecordHomeSectionCollapseWTShown, UserPreferencesRecordHomeReservedWTShown, UserPreferencesFavoritesShowTopFavorites, UserPreferencesMyS1WelcomeSplashShown, UserPreferencesExcludeMailAppAttachments, UserPreferencesSuppressTaskSFXReminders, UserPreferencesSuppressEventSFXReminders, UserPreferencesPreviewCustomTheme, UserPreferencesHasCelebrationBadge, UserPreferencesUserDebugModePref, UserPreferencesSRHOverrideActivities, UserPreferencesNewLightningReportRunPageEnabled, UserPreferencesReverseOpenActivitiesView, UserPreferencesHasSentWarningEmail, UserPreferencesHasSentWarningEmail238, UserPreferencesHasSentWarningEmail240, UserPreferencesDismissPersonalSpaceLegalMessage, UserPreferencesNativeEmailClient, UserPreferencesSendListEmailThroughExternalService, UserPreferencesBRELookupTableWelcomeMat, UserPreferencesHideBrowseProductRedirectConfirmation, UserPreferencesHideOnlineSalesAppTabVisibilityRequirementsModal, UserPreferencesHideOnlineSalesAppWelcomeMat, UserPreferencesHideManagedEcaMobilePubModal, UserPreferencesGenAISummarizationUserConsent, UserPreferencesHideFlowTypeChangeConfirmationModal, UserPreferencesShowForecastingRoundedAmounts, HasUserVerifiedPhone, HasUserVerifiedEmail, IsPartner, ContactId, AccountId, CallCenterId, Extension, PortalRole, IsPortalEnabled, FederationIdentifier, AboutMe, FullPhotoUrl, SmallPhotoUrl, IsExtIndicatorVisible, OutOfOfficeMessage, MediumPhotoUrl, DigestFrequency, DefaultGroupNotificationFrequency, LastViewedDate, LastReferencedDate, BannerPhotoUrl, SmallBannerPhotoUrl, MediumBannerPhotoUrl, IsProfilePhotoActive, IndividualId, Calendly__CalendlyLink__c, Hire_Date__c, Employment_Type__c, dfsle__CanManageAccount__c, dfsle__Provisioned__c, dfsle__Status__c, dfsle__Username__c, Region__c, Team__c FROM User WHERE UserType = 'Standard' AND Id='${userId}'`;

            let encodedAgentQuery = encodeURIComponent(agentQuery);
            let nextAgentUrl = `/services/data/v64.0/query?q=${encodedAgentQuery}`;

            const agentUrl = `${instanceUrl}${nextAgentUrl}`;
            const newAgentData = await fetchSalesforceData(
              agentUrl,
              accessToken,
              OVERALL_LOG,
              ERROR_LOG
            );

            data = newAgentData?.records;

            if (data?.length > 0) {
              await insertIntoDynamoDB(process.env.AWS_SOURCE_USERS_TABLE, data[0], "Requester", OVERALL_LOG, ERROR_LOG);
            } else {
              return DEFAULT_REQUESTER_ID;
            }
          }
          userData = { sourceId: sourceId, sourceData: data[0] };
        }
      }

      if (!userData) {
        console.error("No Requester data found for migration.");
        writeLog(OVERALL_LOG, `No Requester data found for migration!!`);
        writeLog(ERROR_LOG, `No Requester data found for migration!!`);
        return;
      }

      writeLog(OVERALL_LOG, `Processing Requester SourceID : ${userData.sourceData[requesterIdKey]} Name: ${userData.sourceData[requesterNameKey]}`);
      writeLog(ERROR_LOG, `Processing Requester SourceID : ${userData.sourceData[requesterIdKey]} Name: ${userData.sourceData[requesterNameKey]}`);

      const formattedRequster = await formatRequesterPayload(userData.sourceData, OVERALL_LOG, ERROR_LOG);
      // console.log({ sourceRequester: userData.sourceData, formattedRequster });
      // return;

      writeLog(
        OVERALL_LOG,
        `Formatted Requester Payload SourceID : ${userData.sourceData[requesterIdKey]} : ${JSON.stringify(formattedRequster)}`
      );

      try {
        const requesterId = await createRequester(userData.sourceData[requesterIdKey], formattedRequster, OVERALL_LOG, ERROR_LOG);

        if (requesterId) {
          console.log(`✅ Requester ${userData.sourceData[requesterIdKey]} created: ${requesterId}`);
          writeLog(OVERALL_LOG, `✅ Requester Source ID : ${userData.sourceData[requesterIdKey]} Created ID: ${requesterId}`);

          await updateDestinationId(
            REQUESTER_TABLE,
            userData.sourceData[requesterIdKey],
            requesterId,
            true,
            "Requester",
            OVERALL_LOG,
            ERROR_LOG
          );

          result.success = 1;
          result.destinationId = requesterId;
        } else {
          console.error("dont know what happended ", requesterId)
          result.failure = 1;
          writeLog(ERROR_LOG, `Error Creating Requester :SourceID : ${userData.sourceData[requesterIdKey]} reponse: ${requesterId}`);
          writeLog(REQUESTER_NOT_CREATED_LOG, ` Requester Created Failed:SourceID : ${userData.sourceData[requesterIdKey]} reponse: ${requesterId}`);
        }
      } catch (error) {
        const frames = error.stack
          .split("\n")
          .filter(line => line.includes(DEFAULT_REQUESTER_ID))
          .map(line => line.trim())
          .join(" | ");
        const errorMessage = `❌ ERROR Source ID ${userData.sourceId} ${formattedRequster.name}: ${error.message} @ ${frames}`;

        console.error(errorMessage);
        writeLog(OVERALL_LOG, errorMessage);
        writeLog(ERROR_LOG, errorMessage);
        result.failure = 1;
        writeLog(REQUESTER_NOT_CREATED_LOG, `SourceID : ${userId}`);
      }

      writeLog(OVERALL_LOG, '━'.repeat(40), '\n\n');
      writeLog(ERROR_LOG, '━'.repeat(40), '\n\n');
      return result;
    };

    // userIds = userIds.slice(0,1);
    const CONCURRENCY = 5;
    for (let i = 0; i < userIds.length; i += CONCURRENCY) {
      const batch = userIds.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(userId => migrateOne(userId)));

      results.forEach(item => (item.failure === 0) && writeLog(REQUESTER_CREATED_LOG, `${item.sourceId} : ${item.destinationId}`));

      const batchSuccess = results.reduce((sum, r) => sum + r.success, 0);
      const batchFailure = results.reduce((sum, r) => sum + r.failure, 0);

      // if (batchSuccess > 0) {
      //   totalSuccess += batchSuccess;
      //   await updateCount('success', moduleId, batchSuccess, OVERALL_LOG, ERROR_LOG);
      // }
      // if (batchFailure > 0) {
      //   totalFailure += batchFailure;
      //   await updateCount('failure', moduleId, batchFailure, OVERALL_LOG, ERROR_LOG);
      // }

      console.log(`Batch ${i / CONCURRENCY + 1} completed: ${batchSuccess} succeeded, ${batchFailure} failed`);
      console.log(`Total Success : ${totalSuccess} \n Total Failure : ${totalFailure}`)
      writeLog(OVERALL_LOG, `Batch ${i / CONCURRENCY + 1} completed: ${batchSuccess} succeeded, ${batchFailure} failed`);

      if (singleUserId) {
        console.log("SINGLE USER ID", results[0]?.destinationId);
        return !!results && results[0]?.destinationId;
      }
    }

    writeLog(OVERALL_LOG, `Total Success : ${totalSuccess}  Total Failure : ${totalFailure}`);
    writeLog(OVERALL_LOG, '*'.repeat(40), '\n\n')
    writeLog(ERROR_LOG, '*'.repeat(40), '\n\n')

    return `Requesters Migrated Successfully`
  } catch (error) {
    let errorMessage = error.stack ? `❌ ERROR occurred at migrating Requesters: ${error.message
      } @ ${error.stack
        .split("\n")
        .filter((line) => line.includes(PROJECT_DIRECTORY))
        .map((line) => line.trim())
        .join("\n")}` : JSON.stringify(error)
    console.error(errorMessage);

    writeLog(OVERALL_LOG, errorMessage)
    writeLog(ERROR_LOG, errorMessage)
    return null;
  }
}

module.exports = { requesterMigration };
