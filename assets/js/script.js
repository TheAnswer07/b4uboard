// use this js file to create our user interface- append elements to the root function in order to display to the page

// Data Section. ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// This section contains functionality of fetching data using different APIs and saving them in Object format.
let map;
let countryInfo = {};
let countryLat = 0;
let countryLon = 0;
let countryBorderLayer;

// Take in a lattitude, longitude and a zoom level and pan the map to given coordinates with the specified zoom level. 
function setMapView(lat, lon, zoom) {
    map.setView([lat, lon], zoom);
}

// Fetches the set of coordinates that represent the boundary of the given country and render them on map.
function getCountryBorders(country) {
    // Fetch the boundary coordinates using OpenStreetMap API.
    fetch(`https://nominatim.openstreetmap.org/search?country=
      ${country}&polygon_geojson=1&format=json`)

        .then(function (response) {
            return response.json()
        }).then(function (data) {
            // Get the geojson co-ordinates and use leaflet's geoJSON method to render the boundary.
            countryBorderLayer = L.geoJSON(data[0].geojson, {
                color: 'green',
                weight: 2,
                opacity: 0.6,
                fillOpacity: 0.0
            });
            countryBorderLayer.addTo(map);
        });
}


// Fetches the general information of the given country using restcountries API.
function getGeneralInfoData(country) {
    // Fetch country data
    return fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.status === 404) {
                errorModal();
                console.log(53);
                return;
            } else {
                // Parse the latitude and longitude of the country.
                countryLat = data[0].latlng[0];
                countryLon = data[0].latlng[1];
                // Get the area of the country.
                let area = data[0].area;
                // Get the zoom level that can fit the country area.
                let zoomLevel = getZoomLevel(area);
                // Fetch and render the country boundary.
                getCountryBorders(country);
                // Pan the map to country's location.
                setMapView(countryLat, countryLon, zoomLevel);
                // Parse the country information.
                parseCountryInfo(data[0]);
                // Fetch country's risk data.
                getRiskData(data[0].cca2);
                return data[0].capital[0];
            }
        });
}

// Returns the zoom level for the map that fits the given area.
function getZoomLevel(area) {
    if (area < 99000) {
        return 6;
    } else if (area < 500000) {
        return 5;
    } else if (area < 2500000) {
        return 4;
    } else if (area < 9500000) {
        return 3;
    } else {
        return 2;
    }
}

// Parse the country information from response and stores in a object format.
function parseCountryInfo(country_data) {
    countryInfo['flag'] = country_data.flags.png;
    countryInfo['coat_of_arms'] = country_data.coatOfArms.png;
    countryInfo['currencies'] = country_data.currencies;
    countryInfo['languages'] = country_data.languages;
    countryInfo['capital'] = country_data.capital[0];
    countryInfo['population'] = country_data.population;
    countryInfo['continents'] = country_data.continents;
    countryInfo['area'] = country_data.area;
    countryInfo['name'] = country_data.name.common;
}

// Fetch the risk data for the given country.
// country_code is the 2-letter country code.
function getRiskData(country_code) {
    // Fetch risk score using travel-advisory API.
    fetch(`https://www.travel-advisory.info/api?countrycode=${country_code}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            countryInfo['risk_score'] = data.data[country_code].advisory.score;
            // We have all the country information. Display it.
            displayCountryInfo(countryInfo);
        });
}

// Fetches and returns the image of the given city using Wikipedia API.
function getBGImg(city) {
    var url = "https://en.wikipedia.org/w/api.php";
    var params = {
        action: "query",
        prop: "pageimages",
        titles: city,
        format: "json",
        piprop: "original"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });
    // Return the promise.
    return fetch(url)
        .then(function (response) { return response.json(); })  // conversion to json/dict  
        .then(function (response) {
            console.log(response, "resp");
            var pages = response.query.pages;

            for (var page in pages) {
                console.log("1", pages[page].original.source);
                return pages[page].original.source;
            }
        })
}

// UI Section ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// This section handles creating required HTML for the page and adding it to the DOM.
// root element of the DOM - connects our js to html file - append the outside-most element containers to this function ---------------
const root = $('#root');

// create function to search box exception handling
function errorModal() {
    var myModalEl = $('#invalidSearchModal');
    $(myModalEl).modal('show');
}


// Logo Header ------------------------------------------------------------------------------------------
// Create a div with an img tag to display the brand logo and append it to the root.
let logoHeader = $('<header class="row">');
let imgContainer = $('<div class="col-12">');
let logoImg = $('<img src="./assets/image/Logo.png" ID="logo"  alt="Project Logo"/>')
    .css('width', '100px');
imgContainer.append(logoImg);
logoHeader.append(imgContainer);
root.append(logoHeader);

// Inputs -----------------------------------------------------------------------------------------------
// Container div for search input and the country dropdown menu.
let inputContainer = $('<div class="row d-flex justify-content-around align-items-center">');

// add all countries to this array ---> List is here: https://gist.github.com/incredimike/1469814
let countryList = [
    'Germany',
    'Morocco',
    'Belgium',
    'Cook Islands',
    'Ecuador',
    'Saint Kitts and Nevis',
    'Rwanda',
    'Guyana',
    'Northern Mariana Islands',
    'Botswana',
    'Bouvet Island',
    'China',
    'Grenada',
    'Senegal',
    'Guam',
    'Republic of the Congo',
    'Thailand',
    'Jordan',
    'Colombia',
    'Pitcairn Islands',
    'Norway',
    'Comoros',
    'French Southern and Antarctic Lands',
    'Cape Verde',
    'Cyprus',
    'Kiribati',
    'Central African Republic',
    'Caribbean Netherlands',
    'Puerto Rico',
    'Cocos (Keeling) Islands',
    'Palestine',
    'Turkmenistan',
    'British Indian Ocean Territory',
    'Qatar',
    'Greenland',
    'Romania',
    'Saint Helena, Ascension and Tristan da Cunha',
    'Niue',
    'Republic of India',
    'Réunion',
    'Uzbekistan',
    'Armenia',
    'Kuwait',
    'Sint Maarten',
    'Bulgaria',
    'Israel',
    'Uruguay',
    'Vanuatu',
    'Vietnam',
    'American Samoa',
    'Burkina Faso',
    'Panama',
    'French Guiana',
    'Iraq',
    'Taiwan',
    'Ivory Coast',
    'Sri Lanka',
    'Moldova',
    'United Kingdom',
    'Greece',
    'São Tomé and Príncipe',
    'Mali',
    'South Africa',
    'Iceland',
    'South Korea',
    'Chile',
    'Mauritius',
    'Kosovo',
    'Slovenia',
    'Czechia',
    'San Marino',
    'Belarus',
    'Georgia',
    'Switzerland',
    'Cuba',
    'Norfolk Island',
    'DR Congo',
    'Saint Martin',
    'Sweden',
    'Hungary',
    'Aruba',
    'United Arab Emirates',
    'Montenegro',
    'North Korea',
    'Tajikistan',
    'Libya',
    'Yemen',
    'Netherlands',
    'Heard Island and McDonald Islands',
    'New Caledonia',
    'Kazakhstan',
    'British Virgin Islands',
    'Lebanon',
    'Nigeria',
    'Antigua and Barbuda',
    'Poland',
    'Bosnia and Herzegovina',
    'Australia',
    'Algeria',
    'Madagascar',
    'Trinidad and Tobago',
    'Suriname',
    'Nepal',
    'Indonesia',
    'Azerbaijan',
    'Spain',
    'El Salvador',
    'Hong Kong',
    'Tokelau',
    'Marshall Islands',
    'Russia',
    'Saint Lucia',
    'Tuvalu',
    'Equatorial Guinea',
    'Malaysia',
    'Malawi',
    'Seychelles',
    'Malta',
    'Dominica',
    'Oman',
    'Angola',
    'Portugal',
    'Cameroon',
    'Estonia',
    'Eritrea',
    'Mauritania',
    'Montserrat',
    'Canada',
    'Luxembourg',
    'Albania',
    'Saint Pierre and Miquelon',
    'Mayotte',
    'Fiji',
    'Sierra Leone',
    'Turks and Caicos Islands',
    'Curaçao',
    'Ukraine',
    'North Macedonia',
    'Andorra',
    'Namibia',
    'Samoa',
    'Syria',
    'Argentina',
    'Western Sahara',
    'Mozambique',
    'Guinea',
    'Tunisia',
    'Falkland Islands',
    'Lesotho',
    'Croatia',
    'Liberia',
    'Papua New Guinea',
    'Finland',
    'Antarctica',
    'Burundi',
    'Bolivia',
    'Togo',
    'Barbados',
    'Gibraltar',
    'Ethiopia',
    'Chad',
    'Gambia',
    'New Zealand',
    'United States Minor Outlying Islands',
    'Timor-Leste',
    'Turkey',
    'Cambodia',
    'Lithuania',
    'Sudan',
    'Anguilla',
    'Italy',
    'Maldives',
    'French Polynesia',
    'Austria',
    'Belize',
    'Kyrgyzstan',
    'Laos',
    'Dominican Republic',
    'Honduras',
    'Eswatini',
    'Guinea-Bissau',
    'Niger',
    'Peru',
    'Bahrain',
    'Saint Barthélemy',
    'Brunei',
    'Cayman Islands',
    'Paraguay',
    'Benin',
    'Iran',
    'Macau',
    'Mexico',
    'Jersey',
    'Somalia',
    'Latvia',
    'Tanzania',
    'Venezuela',
    'Mongolia',
    'Costa Rica',
    'Tonga',
    'Brazil',
    'Zimbabwe',
    'Bhutan',
    'Kenya',
    'Saint Vincent and the Grenadines',
    'Åland Islands',
    'Isle of Man',
    'Ireland',
    'Haiti',
    'Myanmar',
    'Guadeloupe',
    'Jamaica',
    'Bahamas',
    'France',
    'Singapore',
    'Wallis and Futuna',
    'Faroe Islands',
    'Afghanistan',
    'Svalbard and Jan Mayen',
    'South Sudan',
    'Serbia',
    'Vatican City',
    'Nicaragua',
    'Uganda',
    'United States',
    'Egypt',
    'Martinique',
    'Philippines',
    'South Georgia',
    'Zambia',
    'Solomon Islands',
    'Ghana',
    'Gabon',
    'Pakistan',
    'Saudi Arabia',
    'Guernsey',
    'Guatemala',
    'Nauru',
    'Monaco',
    'Christmas Island',
    'Japan',
    'Liechtenstein',
    'Palau',
    'Djibouti',
    'United States Virgin Islands',
    'Bermuda',
    'Slovakia',
    'Bangladesh',
    'Denmark',
    'Micronesia',
].sort();

// searchbar
// Create an input box with search button and add it to the inputContainer.
let searchbarContainer = $('<div class="col-10 col-lg-4 d-flex m-3">');
let searchGrp = $('<div class="input-group">');
// Search input box.
let searchInput = $('<input type="search" class="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon" />')
    // Add autocomplete functionality using jQuery.
    .autocomplete({
        source: countryList

    })
    .addClass('searchInput');
// Search Button.
let searchBtn = $('<button type="button" class="btn btn-outline-primary">')
    .addClass('searchButton')
    .text('Search');
searchGrp.append(searchInput);
searchGrp.append(searchBtn);
searchbarContainer.append(searchGrp);
inputContainer.append(searchbarContainer);

// dropdown
// Create a drop down menu for the country and append it to the root.
let dropdownContainer = $('<div class="col-10 col-lg-2 d-flex">');
let dropdownBtnGrp = $('<div class="btn-group">');
let dropdownBtn = $('<button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-mdb-toggle="dropdown" aria-expanded="false">')
    .text('Select a Country');
let dropdownMenuUl = $('<ul class="dropdown-menu force-scroll">')
// for loop to create list items (all countries)
for (let i = 0; i < countryList.length; i++) {
    let countryLi = $('<li class="dropdown-item">')
        .text(countryList[i]);
    dropdownMenuUl.append(countryLi);
}
dropdownBtnGrp.append(dropdownBtn);
dropdownBtnGrp.append(dropdownMenuUl);
dropdownContainer.append(dropdownBtnGrp);
inputContainer.append(dropdownContainer);
// Add input container to root.
root.append(inputContainer);

// Content ---------------------------------------------------------------------------------------------
// Container div for the Map and country info table.
const contentContainer = $('<div class="row d-flex justify-content-center">');

// generates landing page content (big map)
function genLandingContent() {
    // Create a div with id 'map'.
    let landingMap = $('<div class="col-12 d-flex justify-content-center m-5" id="map">')
        .css({ "height": "500px", "width": "1200px" });
    contentContainer.append(landingMap);
    root.append(contentContainer);
    // Initialize the map using leaflet library by passing the id 'map' of the div.
    map = L.map('map');
    // Set OpenStreetMap as the source of map tiles.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    // Show the entire world by default.
    setMapView(0, 0, 1);

    // event listeners
    // Add on click listener to search button.
    $('.searchButton').on('click', function () {
        let currentCountry = $('.searchInput').val();
        console.log(currentCountry);
        if (countryList.includes(currentCountry)) {
            genCountryContent(currentCountry);
        } else {
            errorModal();
        }
    })
    // Add click listener to each li in the drop down menu.
    dropdownMenuUl.on('click', 'li', function () {
        let currentCountry = $(this).text();
        console.log(currentCountry);
        genCountryContent(currentCountry);
    })
}

// generates country content (with smaller map, flag, and facts)
function genCountryContent(currentCountry) {
    // Clear the previous entries.
    infoContainer.empty();
    // Clear the boundary layer.
    if (countryBorderLayer != null) {
        map.removeLayer(countryBorderLayer);
    }
    getGeneralInfoData(currentCountry).then(capital => {
        console.log(capital, "capital");
        getBGImg(capital).then(srcImg => {
            console.log(srcImg, "yes 1");
            displayBackground(srcImg);
        });
    });
}

// Create map and add event listener on page load.
genLandingContent();

// Create a container div for displaying the country data.
const infoContainer = $('<div class="row d-flex justify-content-center">');
contentContainer.append(infoContainer);

// Take a URL for an image as input and set it as the background to the country info section.
function displayBackground(imgSRC) {
    infoContainer.css({ 'background-image': `url(${imgSRC})`, 'background-size': 'cover', 'height': '800px', 'padding': '0', 'min-width': '310px' }).addClass('col-10');
}

// Displays the given country info object and displays it in a table format.
function displayCountryInfo(countryInfo) {
    // Add a title with country name.
    var countryTitle = $('<h3>').addClass('country-title');
    countryTitle.appendTo(infoContainer);
    countryTitle.text(countryInfo['name']);

    // Create a table.
    var infoTable = $('<table>').attr('id', 'data-table').addClass('table');
    infoTable.appendTo(infoContainer);

    // Creates a row for displaying flag info.
    var flagRow = $('<tr>');
    flagRow.appendTo(infoTable);
    var flagTitle = $('<td>');
    flagTitle.text('Country Flag: ');
    flagTitle.appendTo(flagRow);
    var flagImageCol = $('<td>');
    flagImageCol.appendTo(flagRow);
    var flagImage = $('<img>').addClass('content-img');
    flagImage.attr('src', countryInfo['flag']);
    flagImage.appendTo(flagImageCol);


    // Creates a row for displaying coat of arms info.
    var coatOfAarmsRow = $('<tr>');
    coatOfAarmsRow.appendTo(infoTable);
    var coatOfAarmsTitle = $('<td>');
    coatOfAarmsTitle.text('Coat Of Arms: ');
    coatOfAarmsTitle.appendTo(coatOfAarmsRow);
    var coatOfArmsImageCol = $('<td>');
    coatOfArmsImageCol.appendTo(coatOfAarmsRow);
    var coatOfAarmsImage = $('<img>').addClass('content-img');
    coatOfAarmsImage.attr('src', countryInfo['coat_of_arms']);
    coatOfAarmsImage.appendTo(coatOfArmsImageCol);

    // Creates a row for displaying currencies.
    var currenciesRow = $('<tr>');
    currenciesRow.appendTo(infoTable);
    var currenciesTitle = $('<td>');
    currenciesTitle.text('Currencies: ');
    currenciesTitle.appendTo(currenciesRow);
    var currenciesValue = $('<td>');
    currenciesValue.appendTo(currenciesRow);
    // Create a string from array of currencies with ', ' as separator.
    var currencyString = '';
    for (const key in countryInfo['currencies']) {
        if (currencyString !== '') {
            currencyString += ', '
        }
        currencyString += countryInfo['currencies'][key]['name'];
    }
    currenciesValue.text(currencyString);

    // Creates a row for displaying languages.
    var languagesRow = $('<tr>');
    languagesRow.appendTo(infoTable);
    var languagesTitle = $('<td>');
    languagesTitle.text('Languages: ');
    languagesTitle.appendTo(languagesRow);
    var languagesValue = $('<td>');
    languagesValue.appendTo(languagesRow);
    var languageString = '';
    // Create a string from array of languages with ', ' as separator.
    for (const key in countryInfo['languages']) {
        if (languageString !== '') {
            languageString += ', '
        }
        languageString += countryInfo['languages'][key];
    }
    languagesValue.text(languageString);

    // Creates a row for displaying Capital information.
    var capitalRow = $('<tr>');
    capitalRow.appendTo(infoTable);
    var capitalTitle = $('<td>');
    capitalTitle.text('Capital: ');
    capitalTitle.appendTo(capitalRow);
    var capitalValue = $('<td>');
    capitalValue.appendTo(capitalRow);
    capitalValue.text(countryInfo['capital']);

    // Creates a row for displaying population.
    var populationRow = $('<tr>');
    populationRow.appendTo(infoTable);
    var populationTitle = $('<td>');
    populationTitle.text('Population: ');
    populationTitle.appendTo(populationRow);
    var populationValue = $('<td>');
    populationValue.appendTo(populationRow);
    populationValue.text(countryInfo['population']);

    // Creates a row for displaying continent.
    var continentsRow = $('<tr>');
    continentsRow.appendTo(infoTable);
    var continentTitle = $('<td>');
    continentTitle.text('Continent: ');
    continentTitle.appendTo(continentsRow);
    var continentValue = $('<td>');
    continentValue.appendTo(continentsRow);
    var continentString = '';
    for (const continent of countryInfo['continents']) {
        if (continentString !== '') {
            continentString += ', '
        }
        continentString += continent;
    }
    continentValue.text(continentString);

    // Creates a row for displaying area of the country.
    var areaRow = $('<tr>');
    areaRow.appendTo(infoTable);
    var areaTitle = $('<td>');
    areaTitle.text('Area: ');
    areaTitle.appendTo(areaRow);
    var areaValue = $('<td>');
    areaValue.appendTo(areaRow);
    areaValue.text(countryInfo['area'] + ' sq mi');

    // Creates a row for displaying risk score.
    var riskRow = $('<tr>');
    riskRow.appendTo(infoTable);
    var riskTitle = $('<td>');
    riskTitle.text('Risk Score: ');
    riskTitle.appendTo(riskRow);
    var riskValue = $('<td>');
    riskValue.appendTo(riskRow);
    riskValue.text(countryInfo['risk_score'] + '/5');
}