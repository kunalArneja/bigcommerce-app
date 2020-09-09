'use strict';

const request = require('request-promise');
  
class Hub {
    async getAccessToken() {
        const options = {
            method: 'POST',
            url: 'https://id-qa01.narvar.qa/auth/realms/Hub/protocol/openid-connect/token',
            form: {
                grant_type: 'password',
                password: 'Hub@2020',
                client_id: 'hub-backend',
                username: 'kunal.arneja@narvar.com'
            }
        };
        const response = await request(options);
        const info = JSON.parse(response);
        console.log(info);
        return info.access_token;
    }

    getJsessionId(token){
        request.post({
            url:'https://id-qa01.narvar.qa/auth/realms/Hub/protocol/openid-connect/token', 
            form:{
                grant_type: 'password',
                password: 'Hub@2020',
                client_id: 'hub-backend',
                username: 'kunal.arneja@narvar.com'
            }}, function (err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                const info = JSON.parse(body);
                console.log(info);
                return info.access_token;
        });
    }

    addTenant(tenantInformation, jsessionId){
        request.post({
            url:'https://id-qa01.narvar.qa/auth/realms/Hub/protocol/openid-connect/token', 
            form:{
                grant_type: 'password',
                password: 'Hub@2020',
                client_id: 'hub-backend',
                username: 'kunal.arneja@narvar.com'
            }}, function (err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                const info = JSON.parse(body);
                console.log(info);
                return info.access_token;
        });
    }

    saveBigCommerceCredentials(retailerInfo, clientId, jsessionId){
        request.post({
            url:'https://id-qa01.narvar.qa/auth/realms/Hub/protocol/openid-connect/token', 
            form:{
                grant_type: 'password',
                password: 'Hub@2020',
                client_id: 'hub-backend',
                username: 'kunal.arneja@narvar.com'
            }}, function (err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                const info = JSON.parse(body);
                console.log(info);
                return info.access_token;
        });
    }
}

module.exports = Hub;