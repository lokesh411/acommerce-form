
// query params should contain pageId, source, psid, country, province, 
// data = { pageId: 'kjasdhkjhsdfkjjaksdf', psid: 'kjasdhfjksdf', source: 'yellowmessenger', country: ['India', 'Afganistan', 'China'], province: ['Chennai', 'abudhabi', 'bengaluru'] }
const getQueryParams = (params, url) => {
    let href = url;
    //this expression is to get the query strings
    let reg = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
    let queryString = reg.exec(href);
    return queryString ? queryString[1] : null;
};
let paramData = ''

const makeAjaxCall = (userData) => {
    $.ajax({
        type: 'POST',
        signature: '6cab9a2aada111452fa2db8ba663fb6e29208d76e6b27b8ec75e97482bf70d2f',
        url: `https://app.yellowmessenger.com/integrations/facebook/${window.pageId}`,
        // url: `http://localhost:8080/facebook/${window.pageId}`,
        data: {
            entry: [{
                id: paramData.pageId,
                messaging: [{
                    sender: {
                        id: paramData.psid
                    },
                    recipient: {
                        id: paramData.pageId
                    },
                    postback: {
                        payload: {
                            event: 'address-value',
                            event_data: userData,
                            uid: paramData.psid,
                            sender: paramData.psid,
                            pageId: paramData.pageId
                        }
                    }
                }]
            }]
        },
        beforeSend: function (x) {
            if (x && x.overrideMimeType) {
                x.overrideMimeType("application/json;charset=UTF-8");
            }
        },
        success: function () {
            closeView();
        },
        // contentType: "application/json"
    });
}
window.onload = () => {
    const mobile = document.getElementById('mobile')
    const address = document.getElementById('address')
    const city = document.getElementById('city')
    const provinceElement = document.getElementById('province')
    const countryElement = document.getElementById('country')
    const postal = document.getElementById('postal')
    const submitForm = document.getElementById('submit-form')
    const paramString = getQueryParams('data', window.location.href);
    const decodedString = decodeURIComponent(paramString)

    
    
    const updateDataInHTML = (data) => {
        const { country, province } = data
        country.forEach((item) => {
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            countryElement.appendChild(option)
        })
        province.forEach(item => {
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            provinceElement.appendChild(option)
        })
    }


    paramData = JSON.parse(decodedString);
    updateDataInHTML(paramData)
    
    const mobileValidator = (number) => {
        const regex = /([6789][0-9]{9})/i
        if (!regex.test(number)) {
            mobile.classList.add('is-invalid')
            return false
        }
        else {
            mobile.classList.remove('is-invalid')
            return true
        }
    }

    const nullValidator = (item, value) => {
        if (value == '') {
            item.classList.add('is-invalid')
            return false
        }
        else {
            item.classList.remove('is-invalid')
            return true
        }
    }

    const validateAllFields = () => {
        if (mobileValidator(mobile.value) || nullValidator(address, address.value) || nullValidator(city, city.value) || nullValidator(postal, postal.value)) {
            if (mobileValidator(mobile.value) && nullValidator(address, address.value) && nullValidator(city, city.value) && nullValidator(countryElement, countryElement.value) && nullValidator(postal, postal.value))
                return true;
        }
        return false;
    }

    const validateForm = () => {
        if (validateAllFields()) {
            console.log('all fields are validated continue')
            const userAddress = {
                mobile: mobile.value,
                address: address.value,
                city: city.value,
                country: countryElement.value,
                postal: postal.value,
                province: provinceElement.value
            }
            if (paramData.source == 'yellowmessenger') {
                window.parent.postMessage(JSON.stringify({
                    event_code: 'ym-client-event', data: JSON.stringify({
                        event: {
                            code: "address-value",
                            data: {
                                address: userAddress
                            }
                        }
                    })
                }), '*');
            } else if (paramData.source == 'facebook') {
                makeAjaxCall(userAddress)
            } else {
                console.log('invalid source')
            }
        } else {
            console.log('fields are not validated.... Please enter the correct value')
        }
    }

    submitForm.addEventListener('click', validateForm);
}





