import { getSigninPage } from '@keystone-6/auth/pages/SigninPage'

export default getSigninPage({"identityField":"email","secretField":"password","mutationName":"authenticateAdminWithPassword","successTypename":"AdminAuthenticationWithPasswordSuccess","failureTypename":"AdminAuthenticationWithPasswordFailure"});
