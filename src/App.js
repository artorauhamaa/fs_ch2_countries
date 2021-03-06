import React, { useState, useEffect } from 'react'
import axios from 'axios'

function ListWeatherData (props) {
  console.log("ListWeatherData", props )
  const weatherDataList= props.weatherDataList
  const theCountry= props.theCountry
  console.log("ListWeatherData", weatherDataList, theCountry )
  if ((weatherDataList === undefined) || (theCountry === undefined)) return  (<div> No weather data retreived</div>)

  const weatherData = weatherDataList.find(element => element.location.name === theCountry.capital)
  if ((weatherData === undefined) || (theCountry === undefined)) return  <div> No matching weather data retreived</div>

  return (
    <div>
      <h2> Weather in {weatherData.location.name} </h2>
      <p> Temperature: {weatherData.current.temperature} </p>
      <img src={weatherData.current.weather_icons} alt="wheather" width="100" />     
     <p> Wind {weatherData.current.wind_speed} mph, direction{weatherData.current.wind_dir} </p>
  </div>
  )
}

function ListCountryDetails (param) {
  console.log("ListCountriesCont1", param)
  var country = param

  if (country.length === 0) return

  return (
      <div>
        <h2> {country.name} </h2>
        <p> Capital: {country.capital} </p>
        <p> Population: {country.population} </p>
        <h3> Languages </h3>
        <ul>
          {country.languages
                  .map(language => <li key={language.iso639_2}> {language.name} </li>) }                  
        </ul>
        <p> </p>
        <img src={country.flag} alt="Flag" width="100" />
      </div>
  )
}

const App = () => {
  const [ countries, setCountries] = useState([]) 
  const [ foundCountries, setFoundCountries] = useState([])
  const [ theCountry, setTheCountry] = useState([])
  const [ findStr, setFindStr ] = useState('')
  const [ weatherDataList, setWeatherDataList] = useState([])  

  // fetching source data from restcounctries site
  console.log("App, RestCountries", countries)
  const effectHookRestC = () => {
    console.log('effectHookRestC')
    axios
      .get('https://restcountries.eu/rest/v2/all')
      .then(response => {
        setCountries(response.data)
        console.log('effectHookRestC promise fulfilled',countries )
      })
  }
  useEffect(effectHookRestC, [])


  console.log("App, WeatherData", weatherDataList, theCountry)
  // fetching data for the weatherstack site
  const axios = require('axios');
  const effectHookWeather = () => {
    console.log('effectHookWeather', weatherDataList, theCountry)
    if ((theCountry.capital !== undefined) && (weatherDataList.find(element => element.location.name === theCountry.capital) === undefined)) {   
      const params = {
        access_key: '9bc1dc52ad1ac39a2e49a0ffee7e4b43',
        query: theCountry.capital
      }
      // console.log(params.query)
      axios
       .get('http://api.weatherstack.com/current', {params})
       .then(response => {
          // the same reason for local variable usage as for findStrHandler i.e. state variable does not reflect immediately the new bvalue
          var newOne = weatherDataList
          newOne[newOne.length] = (response.data)
          setWeatherDataList(newOne)
          setFindStr('') // extra call to state variable, otherwise the screen is not refreshed
          console.log('effectHookWeather promise fulfilled', weatherDataList)
      })
    } 
  }
  useEffect(effectHookWeather, [theCountry])

  // event handler for the country name input field. Executed always when value is changing, event.target.value is the content of the input field
  const findStrHandler = (event) => {
    // console.log("handleFindStrChange1", event.target.value)
    // NOTE: usestate variables show the updated value only when exiting the function/next rendering round. Look at console output for explanation
    // because of this behavior need to use local variables
    var fc = countries.filter(country => country.name.indexOf(event.target.value) !== -1 )
    setFindStr(event.target.value)
    setFoundCountries (fc)
    setTheCountry((fc.length === 1 ) ? fc[0]: []) 
    console.log("handleFindStrChange", foundCountries, fc, theCountry, findStr, event.target.value)
  }

  // event handler for the select buttons. alpha3Code is the unique indentifier for the selected coutnry
  const buttonClickHandler = (event) => { 
    //console.log("buttonClickHanlder", event, event.target.id)
    setTheCountry(foundCountries.filter(country => country.alpha3Code === event.target.id)[0])
    console.log("buttonClickHanlder", foundCountries, theCountry, event.target.id) 
  }

  // takes care of country listing . Function buildRowToSelect creates needed html code (including selection buttons)
  // if the number of countries is between 2-10. In the other scenarios when no further selection is required code is generated by a separate component listCountriesCont
  function formatOutput () {

    // one country selected, either by search criteria or by clicking the buttob
    if(theCountry.name !== undefined ) {
      return (
        <div>
          {ListCountryDetails(theCountry)}
        </div>
      )
    }

    // no matches with the name
   if(foundCountries.length === 0 ) {
      return (
        <div>
          <p>No macthes </p>
        </div>
      )
    }

    // listing 2 ... 10 countries based on the seach criteria with the select button
    if ((foundCountries.length >= 2) && (foundCountries.length <= 10)) {
      return (foundCountries.map(buildRowToSelect)) 
    }

    return (
        <div>
          <p>Too many matches, specify an other filter </p>
        </div>
    )
  }

  // builds the html for the contry. alpha3Code (3 letter acronym for the country) is the unique identfied for the button (id) which will be used when 
  // clicked to identify the specific country
  function buildRowToSelect (country) {
    return(
      <p key={country.alpha3Code}> {country.name} {country.alpha3Code} 
      <button id = {country.alpha3Code} onClick = {buttonClickHandler} type="submit">Select</button> </p>
      )
  }
  
  return (
    <div>
      <h2>Criteria for search</h2>
        <div>
          Find countries: 
          <input 
            value = {findStr}  
            onChange = {findStrHandler}
          />
        </div>
        { formatOutput() }
        <ListWeatherData weatherDataList={weatherDataList} theCountry={theCountry}/>
        </div> 
  )


  // <div>debug: {findStr}</div> 
}

export default App