
// query params should contain pageId, source, psid, country, province, 
// data = { pageId: 'kjasdhkjhsdfkjjaksdf', psid: 'kjasdhfjksdf', source: 'yellowmessenger', country: ['India', 'Afganistan', 'China'], province: ['Chennai', 'abudhabi', 'bengaluru'] }
const getQueryParams = (params, url) => {
    let href = url;
    //this expression is to get the query strings
    let reg = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
    let queryString = reg.exec(href);
    return queryString ? queryString[1] : null;
};
let paramData = '';
// const masterAddress;

const makeAjaxCall = (userData) => {
    $.ajax({
        type: 'POST',
        signature: '6cab9a2aada111452fa2db8ba663fb6e29208d76e6b27b8ec75e97482bf70d2f',
        url: `https://app.yellowmessenger.com/integrations/facebook/${paramData.pageId}`,
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
    const district = document.getElementById('district');
    const subDistrict = document.getElementById('sub-district');
    const submitForm = document.getElementById('submit-form');
    const paramString = getQueryParams('data', window.location.href);
    const decodedString = decodeURIComponent(paramString)
    let selectedProvince = {}, selectedCity ={}, selectedDistrict ={}, selectedSubDistrict ={};

    const removeChildElements = (element) =>{
        return new Promise((resolve) =>{
            const childrenLength = element.children.length - 1
            Array(element.children.length).fill(2).forEach((item,index) => {
                element.removeChild(element.children[childrenLength - index])
            })
            return resolve()
        })
    }

    const filterOutValues = (element, previousKey, currentValue) => {
        const actualValue = element.value;
        return previousKey.filter(item => {
            return actualValue === item[currentValue]
        })
    }

    const populateProvince = () => {
        let allProvinces = new Set()
        master_address.forEach(item => {
            allProvinces.add(item.province)
        })
        Array.from(allProvinces).forEach(item =>{
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            provinceElement.appendChild(option)
        })
        selectedProvince = filterOutValues(provinceElement, master_address, 'province')
        populateCity()
    }
    const populateCity = async () => {
        let allCities = new Set()
        selectedProvince.forEach(item => {
            allCities.add(item.city)
        })
        console.log('city.childNodes ::: ', city.childNodes.length)
        if(city.children.length > 0){
            await removeChildElements(city)
        }
        console.log('city.children after removing ::: ', city.children.length)
        Array.from(allCities).forEach(item =>{
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            city.appendChild(option)
        })
        selectedCity = filterOutValues(city, selectedProvince, 'city')
        populateDistrict()
    }
    const populateDistrict = () => {
        let allDistricts = new Set()
        selectedCity.forEach(item => {
            allDistricts.add(item.district)
        })
        console.log('district.districtNodes ::: ', district.children.length)
        if(district.children.length > 0){
            removeChildElements(district)
        }
        Array.from(allDistricts).forEach(item =>{
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            district.appendChild(option)
        })
        selectedDistrict = filterOutValues(district, selectedCity, 'district')
        populateSubDistrict()
    }
    const populateSubDistrict = () => {
        let allSubDistricts = new Set()
        selectedDistrict.forEach(item => {
            allSubDistricts.add(item.subdistrict)
        })
        if(subDistrict.children.length > 0){
            removeChildElements(subDistrict)
        }
        Array.from(allSubDistricts).forEach(item =>{
            let option = document.createElement('option')
            option.value = item;
            option.innerHTML = item;
            subDistrict.appendChild(option)
        })
        selectedSubDistrict = filterOutValues(subDistrict, selectedDistrict, 'subdistrict')
        console.log('selectedSubDistrict ::: ', selectedSubDistrict)

    }
    populateProvince()
    const provinceChange = () => {
        selectedProvince = filterOutValues(provinceElement, master_address, 'province')
        console.log('selectedProvince ::: ', selectedProvince)
        populateCity()
    }
    const cityChange = () => {
        selectedCity = filterOutValues(city, selectedProvince, 'city')
        console.log('selectedCity ::: ', selectedCity)
        populateDistrict()
    }
    const districtChange = () =>{
        selectedDistrict = filterOutValues(district, selectedCity, 'district')
        console.log('selectedDistrict ::: ', selectedDistrict)
        populateSubDistrict()
    }
    const subDistrictChange = () => {
        selectedSubDistrict = filterOutValues(subDistrict, selectedDistrict, 'subdistrict')
        console.log('selectedSubDistrict ::: ', selectedSubDistrict)
    }
    paramData = JSON.parse(decodedString);

    const mobileValidator = (number) => {
        const regex = /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/gi
        const newNumber = number.replace(/-/g, '').split(' ').join('')
        if (!regex.test(newNumber)) {
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
    const calculatePostal = () => {
        return selectedSubDistrict.postal_code
    }

    const validateAllFields = () => {
        if (mobileValidator(mobile.value) && nullValidator(address, address.value) && nullValidator(city, city.value) && nullValidator(district, district.value) && nullValidator(subDistrict, subDistrict.value)) {
            return true;
        }
        return false;
    }

    const validateForm = () => {
        if (validateAllFields()) {
            console.log('all fields are validated continue')
            const postal = calculatePostal()
            const userAddress = {
                mobile: mobile.value,
                address: address.value,
                city: city.value,
                postal: postal,
                district: district.value,
                subDistrict: subDistrict.value,
                province: provinceElement.value
            }
            if (paramData && paramData.source == 'facebook') {
                makeAjaxCall(userAddress)
            } else {
                console.log('send event to ym')
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
            }
        } else {
            console.log('fields are not validated.... Please enter the correct value')
        }
    }
    provinceElement.addEventListener('change', provinceChange)
    submitForm.addEventListener('click', validateForm);
    city.addEventListener('change', cityChange)
    district.addEventListener('change', districtChange)
    subDistrict.addEventListener('change', subDistrictChange)
}





