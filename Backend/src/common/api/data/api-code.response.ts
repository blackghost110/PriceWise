export enum ApiCodeResponse {

    // Security API Exceptions

    PAYLOAD_PARAM_IS_MISSING = 'api.error.payload-param-is-missing',
    TOKEN_GEN_ERROR = 'api.error.stock-detail',
    USER_ALREADY_EXIST = 'api.security.error.user-exist',
    CREDENTIAL_DELETE_ERROR = 'api.security.error.credential-delete',
    TOKEN_EXPIRED = 'api.security.error.token-expired',
    USER_NOT_FOUND = 'api.security.error.user-not-found',
    SIGNUP_ERROR = 'api.security.error.signup',
    NO_TOKEN_FOUNDED = 'api.security.error.no-token-found',
    PAYLOAD_IS_NOT_VALID = 'api.error.payload-is-not-valid',
    COMMON_SUCCESS = 'api.success.common',


    // Member Service Payload Exceptions

    MEMBER_PAYLOAD_ACTIVE_INVALID = 'api.member.error.payload-active-invalid',
    MEMBER_PAYLOAD_SUBSCRIPTION_NOT_VALID = 'api.member.error.payload-subscription-not-valid',
    MEMBER_PAYLOAD_ACTIVATION_CODE_LENGTH_ERROR = 'api.member.error.payload-activation-code-length-error',
    MEMBER_PAYLOAD_IBAN_LENGTH_ERROR = 'api.member.error.payload-iban-length-error',
    MEMBER_PAYLOAD_PHONE_LENGTH_ERROR = 'api.member.error.payload-phone-length-error',
    MEMBER_PAYLOAD_MAIL_LENGTH_ERROR = 'api.member.error.payload-mail-length-error',
    MEMBER_PAYLOAD_MAIL_IS_NOT_VALID = 'api.member.error.payload-mail-is-not-valid',
    MEMBER_PAYLOAD_BIRTHDATE_IS_NOT_VALID = 'api.member.error.payload-birthdate-is-not-valid',
    MEMBER_PAYLOAD_LASTNAME_LENGTH_ERROR = 'api.member.error.payload-lastname-length-error',
    MEMBER_PAYLOAD_LASTNAME_IS_NOT_STRING = 'api.member.error.payload-lastname-is-not-string',
    MEMBER_PAYLOAD_FIRSTNAME_LENGTH_ERROR = 'api.member.error.payload-firstname-length-error',
    MEMBER_PAYLOAD_FIRSTNAME_IS_NOT_STRING = 'api.member.error.payload-firstname-is-not-string',
    MEMBER_PAYLOAD_MEMBER_ID_LENGTH_ERROR = 'api.member.error.payload-member-id-length-error',
    MEMBER_PAYLOAD_MEMBER_ID_MANDATORY = 'api.member.error.payload-member-id-mandatory',



// Member Service Crud Exceptions

    MEMBER_UPDATE_EXCEPTION = 'api.member.error.update-exception',
    MEMBER_LIST_EXCEPTION = 'api.member.error.list-exception',
    MEMBER_DELETE_EXCEPTION = 'api.member.error.delete-exception',
    MEMBER_NOT_FOUND_EXCEPTION = 'api.member.error.not-found-exception',
    MEMBER_CREATE_EXCEPTION = 'api.member.error.create-exception',


    // MemberPlan Service Crud Exceptions

    MEMBERPLAN_UPDATE_EXCEPTION = 'api.memberplan.error.update-exception',
    MEMBERPLAN_LIST_EXCEPTION = 'api.memberplan.error.list-exception',
    MEMBERPLAN_DELETE_EXCEPTION = 'api.memberplan.error.delete-exception',
    MEMBERPLAN_NOT_FOUND_EXCEPTION = 'api.memberplan.error.not-found-exception',
    MEMBERPLAN_CREATE_EXCEPTION = 'api.memberplan.error.create-exception',


}