const { default: axios } = require("axios");
const dotenv = require('dotenv')
const url = "https://api.api-futebol.com.br/v1";

dotenv.config();

const requestHeaders = {
    "Authorization": "Bearer " + process.env["API_KEY"]
}

exports.getFase = async (fase, time) =>{
    fase = (parseInt(fase) + 90).toString();
    var faseUrl = url + "/campeonatos/2/fases/" + fase;
    var response = await axios.get(faseUrl, {
        headers: requestHeaders
    })

    var body = response.data;
    var result;

    body.chaves.forEach(partida => {
        if(partida.partida_ida.time_mandante.time_id == time || partida.partida_ida.time_visitante.time_id == time){
            result = partida;
        }
    });

    if (!result){
        return {
            message: "O seu time não participu dessa fase"
        };
    }
    return result;
}