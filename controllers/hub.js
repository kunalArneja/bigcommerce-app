'use strict';

const request = require('request-promise');

class Hub {
    async getAccessToken(email, password) {
        const options = {
            method: 'POST',
            url: 'https://id-qa01.narvar.qa/auth/realms/Hub/protocol/openid-connect/token',
            form: {
                grant_type: 'password',
                password: password,
                client_id: 'hub-backend',
                username: email
            }
        };
        const response = await request(options);
        const info = JSON.parse(response);
        console.log(info);
        return info.access_token;
    }

    async getJsessionId(token) {
        const options = {
            method: 'GET',
            url: 'https://hub-qa01.narvar.qa/api/users/signedin',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            resolveWithFullResponse: true
        };
        const responseHeaders = await request(options).then(function (response) {
            return response.headers;
        });
        console.log(responseHeaders);
        var sessionId;
        var i;
        for (i = 0; i < responseHeaders['set-cookie'].length; i++) {
            if (responseHeaders['set-cookie'][i].includes("JSESSIONID")) {
                sessionId = responseHeaders['set-cookie'][i].split(";")[0];
            }
        }
        console.log(sessionId);
        return sessionId;
    }

    async addTenant(retailerName, storeHash, jsessionId) {
        const options = {
            method: 'POST',
            url: 'https://hub-qa01.narvar.qa/api/tenants',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': jsessionId
            },
            body: {
                tenant_add: {
                    admin_information: {
                        first_name: 'bcapp',
                        last_name: 'narvar',
                        email: 'kunal.arneja@narvar.com',
                        create_admin: false
                    },
                    tenant: {
                        retailer_name: retailerName,
                        web_url: 'https://store-' + storeHash + '.mybigcommerce.com/',
                        shopify_url: "",
                        uri_moniker: retailerName,
                        types: [
                            "T2"
                        ],
                        products: [
                            "alerts",
                            "bigcommerce",
                            "Returns",
                            "Returns 3.0",
                            "Return Rules 3.0",
                            "Returns rules",
                            "returns_dashboard_2",
                            "Track Beta",
                            "Tracking",
                            "wysiwyg_email_editor"
                        ],
                        carriers: [
                            "usps"
                        ],
                        locales: [
                            "en_US"
                        ],
                        enabled: true,
                        parent_tenant_id: null
                    }
                }
            },
            json: true
        };
        const response = await request(options);
        console.log(response);
        return response;
    }

    async saveBigCommerceCredentials(retailerName, accessToken, storeHash, jsessionId) {
        const options = {
            method: 'POST',
            url: 'https://hub-qa01.narvar.qa/api/toran/v1/graphql',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': jsessionId
            },
            body: [
                {
                    operationName: "updateBigCommerceCreds",
                    variables: {
                        retailer: retailerName,
                        clientId: "d9nnt8i14fn9werfbrmygr4ttqe0brk",
                        clientSecret: "60ca6397790bbf08a9ddf701253975c4204c6db79d8daf2e70baf10dae542668",
                        accessToken: accessToken,
                        storeBaseUrl: "https://api.bigcommerce.com/stores/" + storeHash + "/v3/"
                    },
                    query: "mutation updateBigCommerceCreds($retailer: String!, $clientId: String!, $clientSecret: String!, $accessToken: String, $storeBaseUrl: String!) {\n  updateBigCommerceCreds(authDetails: {retailer: $retailer, clientId: $clientId, clientSecret: $clientSecret, accessToken: $accessToken, storeBaseUrl: $storeBaseUrl}) {\n    statusCode\n    responseMessage\n    __typename\n  }\n}\n"
                }
            ],
            json: true
        };
        const response = await request(options);
        console.log(response);
        return response;
    }

    async createManagerUser(firstname, lastName, email, retailer, jsessionId) {
        const options = {
            method: 'POST',
            url: 'https://hubn-qa01.narvar.qa/nub-user',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': jsessionId
            },
            body: {
                "query": "mutation createUser($retailer: String!, $username: String!, $email: String!, $firstName: String!, $lastName: String!){    createUser(input:{        retailerMoniker: $retailer        username: $username        email: $email        firstName: $firstName        lastName: $lastName        role: MANAGER,        locales: [\"en_US\", \"en_CA\"]       products: [\"Track Beta\"]    }) {        success        message        action    }}",
                "variables": {
                    "retailer": retailer,
                    "username": email,
                    "email": email,
                    "firstName": firstname,
                    "lastName": lastName
                }

            },
            json: true
        };
        const response = await request(options);
        console.log(response);
        return response;
    }

    async getUserIdByEmail(email, token) {
        const options = {
            method: 'GET',
            url: 'https://id-qa01.narvar.qa/auth/admin/realms/Hub/users?username=' + email,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };
        const response = await request(options);
        const info = JSON.parse(response);
        return info[0].id;
    }

    async setUserPassword(userId, password, token) {
        const options = {
            method: 'PUT',
            url: 'https://id-qa01.narvar.qa/auth/admin/realms/Hub/users/' + userId + '/reset-password',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: {
                type: "password",
                temporary: false,
                value: password
            },
            json: true
        };
        const response = await request(options);
        return response;
    }
}

module.exports = Hub;