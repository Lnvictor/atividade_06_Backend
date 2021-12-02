const { default: axios } = require("axios");
const dotenv = require('dotenv')
const url = "https://api.api-futebol.com.br/v1";

dotenv.config();

const requestHeaders = {
    "Authorization": "Bearer " + process.env["API_KEY"]
}

exports.getBrasileiraoTable = async () => {
    var tableUrl = url + "/campeonatos/10/tabela";
 
    var response = await axios.get(tableUrl, {
        headers: requestHeaders
    })
    return response
}

exports.getBrasileiraoRodada = async (rodada, time) => {
    console.log(rodada + "\n\n\n")
    var fixtureUrl = url + "/campeonatos/10/rodadas/" + rodada;

    var response = await axios.get(fixtureUrl, {
        headers: requestHeaders
    })

    var body = response.data;
    var result;

    body.partidas.forEach(partida => {
        if(partida.time_mandante.time_id == time || partida.time_visitante.time_id == time){
            result = partida;
        }
    });

    return result;
};

exports.getTeams = async () => {
    var tableUrl = url + "/campeonatos/10/tabela";
    var response = await axios.get(tableUrl, {
        headers: requestHeaders
    });

    var data = response.data;
    var result = Array();
    data.forEach(time => {
        result.push(time.time.nome_popular);
    });
    return result;
}