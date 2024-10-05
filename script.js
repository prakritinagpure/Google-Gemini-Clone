const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const  suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

// api configuration
const API_KEY = "AIzaSyAuFBlWErMwo4ocBw2iCnss6oyX97vb8u0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAuFBlWErMwo4ocBw2iCnss6oyX97vb8u0`;

const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle(".hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);
}



loadLocalstorageData();


//create a new message element and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message-outgoing", ...classes);
    div.innerHTML = content;
    return div;

}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

     const typingInterval = setInterval(() => {

         textElement.innerText += (currentWordIndex === 0 ? ' ' : ' ') + words[currentWordIndex++];


         incomingMessageDiv.querySelector(".icon").classList.add("hide");
         if (currentWordIndex === words.length) {
             clearInterval(typingInterval);

             isResponseGenerating = false;

            incomingMessageDiv.querySelector(".icon").classList.remove("hide");


             localStorage.setItem("savedChats", chatList.innerHTML);
             chatList.scrollTo(0, chatList.scrollHeight);
            
        }
     }, 75);
}

const generateAPIResponse = async(incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
      const response = await fetch(API_URL, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              contents: [
                  {
                      parts: [
                          {
                              text: userMessage
                          }
                      ]
                  }
              ]
          })
      });
  
      // Check for response status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
       // Convert response to JSON
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      //get the api response text
      const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
      showTypingEffect(apiResponse, textElement, incomingMessageDiv);

      //textElement.innerText = apiResponse;

  
       
      //console.log(apiResponse);
  
    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
      console.log("Error:", error);
    }
    finally{
        incomingMessageDiv.classList.remove("loading");
    
    }
  
  
}









//     if (!incomingMessageDiv) {
    //         console.log("incomingMessageDiv is undefined or null");
    //         return;
        
    //    }
    //    const loadingElement = incomingMessageDiv.querySelector(".loading");
    //     if (loadingElement) {
    //         loadingElement.remove(); // Remove the element only if it exists
    //     } else {
    //         console.log("Loading element not found");
    //     }








//const generateAPIResponse = async() =>{
 // try {
    //const response = await fetch(API_URL, {
      //  method: "POST",
       // data: {
          //  "contents":[
             //   {"parts":[{"text":"Explain how AI works"}]}]},
        // headers: {"Content-Type": "application/json" },
        // body: JSON.stringify({
        //     contents: [{
        //         role: "user",
        //         parts: [{
        //             text: userMessage
        //          }]
        //         }]
        //})
        
    //});
    //console.log(response);

    
  //} catch (error) {
   // console.log(error);
 // }
//}
// show a loading animation while waiting for the api response
const showLoadingAnimation = () =>{
    const html = `<div class="message-content">
                <img src="images/gemini.svg" alt="image2" class="image2">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar">
                        
                    </div>
                    <div class="loading-bar">

                    </div>
                    <div class="loading-bar">

                    </div>
                </div>
            </div>
    <span onClick = "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "message-incoming", "loading");
                   
    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTo(0, chatList.scrollHeight);

    generateAPIResponse(incomingMessageDiv);
                               

}


const copyMessage = (copyIcon) =>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;
    

    const html = `<div class="message-content">
                    <img src="images/user.jpg" alt="image1" class="image1">
                    <p class="text"></p>
                   </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500);
}

suggestions.forEach(suggestion =>{
    suggestion.addEventListener("click", () =>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    })
})

toggleThemeButton.addEventListener("click", () =>{
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode": "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
})

deleteChatButton.addEventListener("click", () =>{
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
        
    }
})


typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
})































// script.js

// document.getElementById('travel-form').addEventListener('submit', function (event) {
//     event.preventDefault();
  
//     const destination = document.getElementById('destination').value;
//     const startDate = document.getElementById('start-date').value;
//     const endDate = document.getElementById('end-date').value;
  
//     // Call functions to fetch the necessary data
//     getWeather(destination);
//     getFlights(destination, startDate, endDate);
//     getHotels(destination, startDate, endDate);
//     getAttractions(destination);
//     initMap(destination);
//   });
  
//   // Initialize the Google Map with destination input
//   function initMap(destination) {
//     const mapDiv = document.getElementById('map');
//     const map = new google.maps.Map(mapDiv, {
//       zoom: 12,
//       center: { lat: 0, lng: 0 } // Default center
//     });
  
//     const geocoder = new google.maps.Geocoder();
//     geocoder.geocode({ address: destination }, function (results, status) {
//       if (status === 'OK') {
//         map.setCenter(results[0].geometry.location);
//         const marker = new google.maps.Marker({
//           map: map,
//           position: results[0].geometry.location
//         });
//       } else {
//         alert('Geocode was not successful for the following reason: ' + status);
//       }
//     });
//   }
  
//   // Fetch weather data
//   function getWeather(destination) {
//     const weatherAPIKey = 'YOUR_WEATHER_API_KEY';
//     const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${destination}&appid=${weatherAPIKey}&units=metric`;
  
//     fetch(weatherURL)
//       .then(response => response.json())
//       .then(data => {
//         document.getElementById('weather').innerHTML = `
//           <h3>Weather in ${data.name}</h3>
//           <p>Temperature: ${data.main.temp}°C</p>
//           <p>Condition: ${data.weather[0].description}</p>
//         `;
//       })
//       .catch(error => console.error('Error fetching weather:', error));
//   }
  
//   // Fetch flights (use a mock API or Skyscanner API)
//   function getFlights(destination, startDate, endDate) {
//     // Assuming a mock API URL or use Skyscanner API
//     const flightURL = `https://mock-flight-api.com/flights?destination=${destination}&startDate=${startDate}&endDate=${endDate}`;
  
//     fetch(flightURL)
//       .then(response => response.json())
//       .then(data => {
//         let flightInfo = '<h3>Available Flights</h3>';
//         data.flights.forEach(flight => {
//           flightInfo += `<p>Flight from ${flight.origin} to ${destination}: $${flight.price}</p>`;
//         });
//         document.getElementById('flights').innerHTML = flightInfo;
//       })
//       .catch(error => console.error('Error fetching flights:', error));
//   }
  
//   // Fetch hotels (use a mock API or Booking.com API)
//   function getHotels(destination, startDate, endDate) {
//     // Assuming a mock API URL or use Booking.com API
//     const hotelURL = `https://mock-hotel-api.com/hotels?destination=${destination}&startDate=${startDate}&endDate=${endDate}`;
  
//     fetch(hotelURL)
//       .then(response => response.json())
//       .then(data => {
//         let hotelInfo = '<h3>Available Hotels</h3>';
//         data.hotels.forEach(hotel => {
//           hotelInfo += `<p>${hotel.name}: $${hotel.price} per night</p>`;
//         });
//         document.getElementById('hotels').innerHTML = hotelInfo;
//       })
//       .catch(error => console.error('Error fetching hotels:', error));
//   }
  
//   // Fetch attractions (use a mock API or Google Places API)
//   function getAttractions(destination) {
//     // Assuming a mock API URL or use Google Places API
//     const attractionsURL = `https://mock-attractions-api.com/attractions?destination=${destination}`;
  
//     fetch(attractionsURL)
//       .then(response => response.json())
//       .then(data => {
//         let attractionsInfo = '<h3>Local Attractions</h3>';
//         data.attractions.forEach(attraction => {
//           attractionsInfo += `<p>${attraction.name}: ${attraction.description}</p>`;
//         });
//         document.getElementById('attractions').innerHTML = attractionsInfo;
//       })
//       .catch(error => console.error('Error fetching attractions:', error));
//   }
  