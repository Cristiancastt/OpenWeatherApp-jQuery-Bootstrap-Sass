$(document).ready(function() {
    // Definición de variables y constantes
    const apiKey = "477d4a76ce2a96176d5612892caf1b35";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&lang=en&";
    const apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?";
    const input = $("#input");
    const btnBuscar = $("#btnBuscar");
    const homeLink = $("#home-link");
    const weatherLink = $("#weather-link");
    const locationButton = $("#location-button");
    const video = $("#video");

    // Manejo de la geolocalización al hacer clic en el botón de ubicación
    locationButton.on("click", async() => {
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

                const response = await fetch(apiUrl);
                const data = await response.json();

                const city = data.address.city || data.address.town;
                const region = data.address.state || data.address.region;
                const country = data.address.country;

                // Mostrar la información en la card
                searchWeather(city);
                input.val(city);
            } catch (error) {
                console.error("Error al obtener la información de ubicación:", error);
            }
        } else {
            alert("La geolocalización no está disponible en este navegador.");
        }
    });

    // Función para mostrar la vista de inicio
    function showHomeView() {
        $("#home").removeClass("d-none");
        video.removeClass("d-none");
        $("#overlay").removeClass("d-none");
        $("#weather").addClass("d-none");
    }


    // Función para mostrar la vista del clima
    function showWeatherView() {

        fadeIn(document.getElementById("home"), 1000)
        $("#home").addClass("d-none");
        fadeIn(document.getElementById("video"), 1000)
        video.addClass("d-none");
        fadeIn(document.getElementById("overlay"), 1000)
        $("#overlay").addClass("d-none");
        fadeIn(document.getElementById("weather"), 1000)
        $("#weather").removeClass("d-none");
    }

    // Función para manejar el cambio de hash
    function handleHashChange() {
        var currentHash = window.location.hash;
        if (currentHash === "#weather") {
            showWeatherView();
        } else {
            showHomeView();
        }
    }

    // Comprobar la ruta actual al cargar la página
    if (window.location.hash == "#weather") {
        handleHashChange();
    } else {
        showHomeView();
    }

    // Manejar el cambio de ruta cuando se produce un cambio de hash
    $(window).on("hashchange", handleHashChange);

    // Función para obtener el nombre del día de la semana
    function getDayOfWeek(dayIndex) {
        var daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        return daysOfWeek[dayIndex];
    }

    // Función para buscar información del clima
    function searchWeather(city) {
        // Obtener pronóstico
        $.ajax({
            url: apiUrlForecast + "q=" + city + "&appid=" + apiKey,
            method: "GET",
            dataType: "json",
            success: function(data) {
                console.log(data)
                    // Obtén la información de las próximas 4 predicciones para los días
                var forecasts = data.list.filter(function(forecast) {
                    // Filtra los pronósticos para mostrar solo uno por día (a las 12:00 PM)
                    return new Date(forecast.dt_txt).getHours() === 12;
                }).slice(0, 4);

                // Actualiza la información en la interfaz
                forecasts.forEach(function(forecast, index) {
                    var dateTxt = new Date(forecast.dt * 1000);
                    var dayOfWeek = getDayOfWeek(dateTxt.getDay());
                    var weather = forecast.weather[0].main;
                    var temp = forecast.main.temp;


                    $("#temp" + (index + 1)).text(Math.round(temp % 273.15) + "ºC");
                    $("#date" + (index + 1)).text(dayOfWeek);
                    $("#info" + (index + 1)).text(forecast.weather[0].description);
                    $("#weather" + (index + 1)).attr("src", "./resources/images/" + weather + ".png");
                });
            },
            error: function(error) {
                console.error("Error:", error);
            },
        });

        // Obtener información actual del clima
        $.ajax({
            url: apiUrl + "q=" + city + "&appid=" + apiKey,
            method: "GET",
            dataType: "json",
            success: function(data) {
                var cityName = data.name;
                var country = data.sys.country;
                var weatherMain = data.weather[0].main;
                var temperature = data.main.temp;
                var humidity = data.main.humidity;
                var windSpeed = data.wind.speed;

                $("#city").text(cityName);
                $("#country").text(country);
                $("#weather-icon").attr("src", "./resources/images/" + weatherMain + ".png");
                $("#temperature").text(Math.round(temperature) + "ºC");
                $("#humidity").text(humidity + "%");
                $("#wind-speed").text(windSpeed + "Km/h");
            },
            error: function(error) {
                console.error("Error:", error);
            },
        });
    }

    // Manejar búsqueda de clima al hacer clic en el botón de búsqueda
    btnBuscar.click(function() {
        searchWeather(input.val());
    });

    const htmlElement = document.querySelector("html");

    // Declarar la variable darkmode y recuperar su valor desde localStorage si está disponible
    var darkmode = localStorage.getItem("darkmode") === "true";
    const dark = $("#dark");

    // Función para actualizar el tema (modo claro o oscuro)
    function updateTheme() {
        if (darkmode) {
            htmlElement.setAttribute("data-bs-theme", "light");
            dark.html('<i class="fa-solid fa-moon"></i> Dark Mode');
        } else {
            htmlElement.setAttribute("data-bs-theme", "dark");
            dark.html('<i class="fa-solid fa-sun"></i> Light Mode');
        }
    }
    updateTheme();

    // Manejar el cambio de tema al hacer clic en el botón de cambio de tema
    dark.on("click", function() {
        darkmode = !darkmode;
        localStorage.setItem("darkmode", darkmode);
        updateTheme();
    });
});





function fadeIn(element, duration) {
    element.style.opacity = 0; // Cambia la propiedad de display a 'block'
    let opacity = 0;
    const interval = 50; // Intervalo de tiempo para la animación (en milisegundos)
    const increment = (interval / duration);

    const fade = () => {
        opacity += increment;
        element.style.opacity = opacity;

        if (opacity >= 1) {
            clearInterval(fadeInterval);
        }
    };

    const fadeInterval = setInterval(fade, interval);
}


function fadeOut(element, duration) {
    let opacity = 1;
    const interval = 50; // Intervalo de tiempo para la animación (en milisegundos)
    const decrement = (interval / duration);

    const fade = () => {
        opacity -= decrement;
        element.style.opacity = opacity;

        if (opacity <= 0) {
            element.style.display = 'none';
            clearInterval(fadeInterval);
        }
    };

    element.style.display = 'none';
    const fadeInterval = setInterval(fade, interval);
}