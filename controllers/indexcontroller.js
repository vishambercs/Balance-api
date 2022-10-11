const Networks = require('../Models/network.js');
var mongoose = require('mongoose');
var Constant = require('../common/Constant');
const Web3 = require('web3');
const TronWeb = require('tronweb')
const axios = require('axios')
var stringify = require('json-stringify-safe');
require('dotenv').config();
async function Check_BTC_Balance(address) {
    try {
        let COINGECKO_URL = "http://blockchain.info/q/addressbalance/" + address
        response = {}
        await axios.get(COINGECKO_URL, { params: {}, headers: {} }).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        }).catch(error => {
            console.error("Error", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        var stringify_response = JSON.parse(response.data)
        let balance_format = parseFloat(stringify_response.data) / 100000000
        return { "status": 200, "balance": stringify_response.data, "format_balance": balance_format }
    }
    catch (error) {
        console.log("error", error)
        return { "status": 400, "balance": 0, "format_balance": 0 }
    }
}

module.exports =
{
    async create_or_update_network(req, res) {
        if (req.headers.authorization != process.env.AUTH_CODE) {
            let balanceData = {}
            let variable = req.body.coin + "-" + req.body.network
            balanceData[variable] = { "balance": balance, "format_balance": format_balance }
            balanceData["status"] = 400
            balanceData["message"] = "Invalid Request"
            return res.json(balanceData)
        }
        try {
            if (req.body.id == "0") {
                let network = await Networks.insertMany([{
                    id: mongoose.Types.ObjectId(),
                    coin: req.body.coin,
                    network: req.body.network,
                    libaraytype: req.body.libaraytype,
                    cointype: req.body.cointype,
                    contractaddress: req.body.contractaddress,
                    nodeurl: req.body.nodeurl,
                    icon: (req.body.icon == undefined || req.body.icon == "") ? "" : req.body.icon,
                    timestamps: new Date().toString(),
                }])
                res.json({ status: 200, data: network, message: "Saved" })
            }
            else {
                let network = await Networks.findOneAndUpdate({ 'id': req.body.id },
                    {
                        $set:
                        {
                            coin: req.body.coin,
                            libaraytype: req.body.libaraytype,
                            cointype: req.body.cointype,
                            contractaddress: req.body.contractaddress,
                            nodeurl: req.body.nodeurl,
                            icon: (req.body.icon == undefined || req.body.icon == "") ? "" : req.body.icon,
                        }
                    },
                    { returnDocument: 'after' }
                )
                res.json({ status: 200, data: network, message: "Updated" })
            }

        }
        catch (error) {
            console.log("create_or_update_network", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async all_networks(req, res) {
        try {
            if (req.headers.authorization != process.env.AUTH_CODE) {
                let balanceData = {}
                let variable = req.body.coin + "-" + req.body.network
                balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                balanceData["status"] = 400
                balanceData["message"] = "Invalid Request"
                return res.json(balanceData)
            }
            let network = await Networks.find()
            res.json({ status: 200, data: network, message: "Saved" })
        }
        catch (error) {
            console.log("create_or_update_network", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getBalance(req, res) {
        let balance = 0
        let format_balance = 0
      
        let balanced_data_array = [];
        try {
            console.log("=========getBalance==========", req.body)
            let parameters = req.body
            if (req.headers.authorization != process.env.AUTH_CODE) 
            {
                return res.json({ "status": 400, "data": balanced_data_array, "message": "Invalid Request" })
            }
            
            Promise.all(parameters.map(async function (arrayItem) {
                let balanceData = {}
                console.log("=========arrayItem==========", arrayItem)
                let networkdetails = await Networks.findOne({ "network": arrayItem.network, "coin": arrayItem.coin })

                if (networkdetails == null) 
                {
                 
                    let variable = arrayItem.network + "-" + arrayItem.coin
                    balanceData[variable]  = { "balance": balance, "format_balance": format_balance }
                    balanceData["status"]  = 400
                    balanceData["message"] = "Does not support this network : " + arrayItem.network
                    return balanceData
                }
                if (networkdetails.libaraytype == "Web3") {
                    const WEB3 = new Web3(new Web3.providers.HttpProvider(networkdetails.nodeurl))
                    if (networkdetails.contractaddress != "") 
                    {
                        const contract = new WEB3.eth.Contract(Constant.USDT_ABI, networkdetails.contractaddress);
                        balance = await contract.methods.balanceOf(arrayItem.address.toLowerCase()).call();
                        let decimals = await contract.methods.decimals().call();
                        format_balance = balance / (1 * 10 ** decimals)
                        let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                        balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                        balanceData["status"] = 200
                        return balanceData
                    }
                    else 
                    {
                    balance = await WEB3.eth.getBalance(arrayItem.address.toLowerCase())
                    format_balance = await Web3.utils.fromWei(balance.toString(), 'ether')
                    let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                    balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                    balanceData["status"] = 200
                    return balanceData
                    }
                }
                else if (networkdetails.libaraytype == "Tronweb") {
                    let url = networkdetails.nodeurl;
                    let headers = {};
                    headers["TRON-PRO-API-KEY"] = "033d869f-6656-4f12-8ffa-b8550f5e6791";
                    const tronWeb = new TronWeb({ fullHost: url, headers: headers, privateKey: "50605a439bd50bdaf3481f4af71519ef51f78865ac69bd2fda56e90be5185c78"});
                    if (networkdetails.contractaddress != "") 
                    {
                        let contract = await tronWeb.contract().at(networkdetails.contractaddress);
                        let balance = await contract.balanceOf(arrayItem.address).call();
                        format_balance = tronWeb.toBigNumber(balance)
                        format_balance = tronWeb.toDecimal(format_balance)
                        format_balance = tronWeb.fromSun(format_balance)
                        format_balance = tronWeb.toBigNumber(format_balance)
                        format_balance = tronWeb.toDecimal(format_balance)
                        let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                        balanceData[variable] = { "balance": tronWeb.toDecimal(balance), "format_balance": format_balance }
                        balanceData["status"] = 200
                        return balanceData
                   
                    }
                    else 
                    {
                    let balance = await tronWeb.trx.getBalance(arrayItem.address)
                    let format_native_balance = tronWeb.toBigNumber(balance)
                    format_native_balance = tronWeb.toDecimal(format_native_balance)
                    format_native_balance = tronWeb.fromSun(format_native_balance)
                    let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                    balanceData[variable] = { "balance": balance, "format_balance": format_native_balance }
                    balanceData["status"] = 200
                    return balanceData
                  }
                }
                else if (networkdetails.libaraytype == "BTC") 
                {        
                    let data = await Check_BTC_Balance(arrayItem.address)
                    let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                    balanceData[variable] = { "balance": data.balance, "format_balance": data.format_balance } 
                    balanceData["status"] = 200
                    return balanceData
                }
            })).then(coinMarkets => {  
                balanced_data_array.push(coinMarkets) 
                res.json({ "status": 200, "data": balanced_data_array[0], "message": "Data Updated" })
            })
        }
        catch (error) {
            console.log("==============error==============", error)
            return res.json({ "status": 400, "data": [], "message": "Invalid Request" })
        }
    }

}