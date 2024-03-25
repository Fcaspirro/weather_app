import { ACCUWEATHER_API_KEY, MAPBOX_TOKEN } from './env.js'; //SUBSTITUA O NOME DO ARQUIVO '/env-sample.js' PARA './env.js'

$(function(){
    
// *** APIs ***
// clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
// pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
// pegar coordenadas do IP: http://www.geoplugin.net
// gerar gráficos em JS: https://www.highcharts.com/demo

    var AccuweatherAPIKey = ACCUWEATHER_API_KEY;
    var MapboxToken = MAPBOX_TOKEN;
    
    var weatherOject = {
        cidade : "",
        estado : "",
        pais : "",
        temperatura : "",
        texto_clima: "", 
        icone_clima: ""
    };

    var dataHoraAtual; 
    var dataHoraFormatada;

    function preencherClimaAgora(cidade, estado, pais, temperatura, texto_clima) {
        var texto_local = cidade + ", " + estado + ", " + pais;
        $("#texto_local").text(texto_local);
        $("#texto_clima").text(texto_clima);
        $("#texto_temperatura").html( String(temperatura) + "&deg;");
        $("#icone_clima").css( "background-image", "url('" + weatherOject.icone_clima + "')" );
    }

    function gerarGrafico(horas, temperaturas) {
        Highcharts.setOptions({
            credits: {
                style: {
                    color: 'Yellow',
                
                },
                position: {
                    y: 20
                }
            }
        });

        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line',
                backgroundColor: {
                    linearGradient: [0, 0, 0, 400],
                    stops: [
                        [0, 'rgba(255,255,255,0.4)'],
                        [1, 'rgba(255,255,255,0.1)']
                    ]
                },
                borderRadius: 10,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0px 1px 24px -1px rgba(0, 0, 0, 0.2)'
            },
            title: {
                text: 'Temperatura hora a hora',
                style: {
                    color: 'white'
                }
            },
            xAxis: {
                categories: horas,
                labels: {
                    style: {
                        color: 'white'
                    }
                },
                lineColor: 'white'
            },
            yAxis: {
                title: {
                    text: 'Temperatura (°C)',
                    style: {
                        color: 'white'
                    }
                },
                labels: {
                    style: {
                        color: 'white'
                    }
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: false,
                    color: 'yellow'
                }
            },
            series: [{
                showInLegend: false,
                data: temperaturas
            }]
        }); 
    }

    function pegarPrevisaoHoraAHora(localCode) {
        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/"+ localCode + "?apikey=" + AccuweatherAPIKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function(data) {
                var horarios = [];
                var temperaturas = [];

                for (var a = 0; a < data.length; a++) {

                    var hora = new Date( data[a].DateTime ).getHours();
                    horarios.push(String(hora) + "h")

                    temperaturas.push(data[a].Temperature.Value) + "&deg"

                    gerarGrafico(horarios, temperaturas);
                    $(".refresh-loader").fadeOut();

                }
            },
            error: function() {
                console.log("Erro no Accuweather (pegarPrevisãoHoraAHora)");
                gerarErro("Erro ao obter previsão hora a hora, tente novamente");
            }
        });  
    }

    function preencherPrevisao5Dias(previsoes) {
        $("#info_5dias").html("");
    
        var diaSemanaAgora = new Date();
    
        var diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sabado"];
    
        var diaSemanaAtual = diasSemana[diaSemanaAgora.getDay()];
        $("#dia_semana_atual").text(diaSemanaAtual);
    
        var elementoHTMLDia = "";
    
        for (var a = 0; a < previsoes.length; a++) {
    
            var dataHoje = new Date(previsoes[a].Date);
            var dia_semana = diasSemana [dataHoje.getDay()];
    
            var iconNumber = previsoes[a].Day.Icon <= 9 ? "0" + String(previsoes[a].Day.Icon) : String(previsoes[a].Day.Icon);
            
            var iconeClima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";
            var minima = String(previsoes[a].Temperature.Minimum.Value);
            var maxima = String(previsoes[a].Temperature.Maximum.Value);
    
            elementoHTMLDia += '<div class="card">';
            elementoHTMLDia +=     '<div class="day col">';
            elementoHTMLDia +=         '<div class="day_inner">';   
            elementoHTMLDia +=             '<div style="background-image: url(\'' + iconeClima + '\')" class="daily_weather_icon"></div>';      
            elementoHTMLDia +=             '<div class="dayname">';
            elementoHTMLDia +=                 dia_semana;
            elementoHTMLDia +=             '</div>' 
            elementoHTMLDia +=             '<div class="max_min_temp">';     
            elementoHTMLDia +=                 minima + '&deg; / ' + maxima + '&deg;';     
            elementoHTMLDia +=             '</div>';
            elementoHTMLDia +=         '</div>';
            elementoHTMLDia +=     '</div>';
            elementoHTMLDia += '</div>';            
        }
    
        $("#info_5dias").append(elementoHTMLDia);
    }

    function pegarPrevisao5Dias(localCode) {
        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/"+ localCode + "?apikey=" + AccuweatherAPIKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function(data) {
                $("#texto_max_min").html( String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; / " + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");

                preencherPrevisao5Dias(data.DailyForecasts);
            },
            error: function() {
                console.log("Erro no Accuweather (pegarPrevisao5Dias)");
                gerarErro("Erro ao obter previsão de 5 dias, tente novamente");
            }
        });    
    }

    function formatarDataHora(dataHora) {
        var horas = ('0' + dataHora.getHours()).slice(-2);
        var minutos = ('0' + dataHora.getMinutes()).slice(-2);
        var segundos = ('0' + dataHora.getSeconds()).slice(-2);
        var horMinSeg = horas + ':' + minutos + ':' + (segundos);

        var dia = ('0' + dataHora.getDate()).slice(-2);
        var mes = ('0' + (dataHora.getMonth() + 1)).slice(-2);
        var ano = dataHora.getFullYear();
        var dataFormatada = dia + '/' + mes + '/' + ano;
    
        return {horMinSeg: horMinSeg, dataFormatada: dataFormatada};
    }    

    function atualizarHora() {
        dataHoraAtual = new Date();
        dataHoraFormatada = formatarDataHora(dataHoraAtual);
        $("#hora_atual").text(dataHoraFormatada.horMinSeg);
    }

    function pegarTempoAtual(localCode) {
        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/"+ localCode + "?apikey=" + AccuweatherAPIKey + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function(data) {
                weatherOject.temperatura = data[0].Temperature.Metric.Value;
                weatherOject.texto_clima = data[0].WeatherText;

                var iconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);

                weatherOject.icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";

                dataHoraAtual = new Date(); 
                dataHoraFormatada = formatarDataHora(dataHoraAtual);
                $("#data_atual").text(dataHoraFormatada.dataFormatada);

                setInterval(atualizarHora, 1000);
                preencherClimaAgora(weatherOject.cidade, weatherOject.estado, weatherOject.pais, weatherOject.temperatura, weatherOject.texto_clima);
            },
            error: function() {
                console.log("Erro no Accuweather (pegarTempoAtual)");
                gerarErro("Erro ao obter clima atual, tente novamente");
            }
        });
    }

    function pegarLocalUsuario(lat, long) {
        $.ajax({
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + AccuweatherAPIKey +"&q=" + lat + "%2C" + long + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function(data) {
                var localCode = data.Key;

                try {
                    weatherOject.cidade = data.SupplementalAdminAreas[0].LocalizedName;
                } catch {
                    weatherOject.cidade = data.ParentCity.LocalizedName;
                }

                weatherOject.estado = data.AdministrativeArea.LocalizedName;
                weatherOject.pais = data.Country.LocalizedName;

                var localCode = data.Key;
                pegarTempoAtual(localCode);
                pegarPrevisao5Dias(localCode);
                pegarPrevisaoHoraAHora(localCode);
            },
            error: function() {
                console.log("Erro no Accuweather (pegarLocalUsuário)");
                gerarErro("Erro no código do local, tente novamente");
            }
        });
    }

    function pegarCoordenadasPesquisa(input) {
        input = encodeURI(input);
        $.ajax({
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input + ".json?access_token=" + MapboxToken,
            type: "GET",
            dataType: "json",
            success: function(data) {
                console.log("mapbox:", data);
                try {
                    var long = data.features[0].geometry.coordinates[0];
                    var lat = data.features[0].geometry.coordinates[1];
    
                    pegarLocalUsuario(lat, long);
                } catch {
                    gerarErro("Erro na pesquisa de local, tente novamente");
                }
            },
            error: function() {
                console.log("Erro no Mapbox");
                gerarErro("Erro na pesquisa de local");
            }
        });
    }

    function pegarCoordIp() {

        var latPadrao = "-23.560015143056905";
        var longPadrao = "-46.65028262143336";

        $.ajax({
            url: "http://www.geoplugin.net/json.gp",
            type: "GET",
            dataType: "json",
            success: function(data) {
                if (data.geoplugin_latitude && data.geoplugin_longitude) {
                    pegarLocalUsuario(data.geoplugin_latitude, data.geoplugin_longitude);
                } else {
                    pegarLocalUsuario(latPadrao, longPadrao);
                }
            },
            error: function() {
                console.log("Erro na requisição");
                pegarLocalUsuario(latPadrao, longPadrao);
                
            }
        });
    }

    function gerarErro (mensagem) {
        if (!mensagem) {
            mensagem = "Ocorreu um erro na solicitação, tente novamente!";
        }

        $(".refresh-loader").hide();
        $("#aviso-erro").text(mensagem);
        $("#aviso-erro").slideDown();
        window.setTimeout(function(){
            $("#aviso-erro").slideUp();
        },4000);
    }

    pegarCoordIp();

    $("#search-button").on('click', function() {
        $(".refresh-loader").fadeIn();
        var local = $("input#local").val();
        if (local) {
            pegarCoordenadasPesquisa(local);
        } else {
            alert("Local Inválido. Tente novamente");
        }
        $(".refresh-loader").fadeOut();
    });

    $("input#local").on('keypress', function(e) {  
        if(e.which == 13) {    
            $(".refresh-loader").fadeIn();      
            var local = $("input#local").val();
            if (local) {
                pegarCoordenadasPesquisa(local);
            } else {
                alert("Local Inválido. Tente novamente");
            }
        }
    });

});
