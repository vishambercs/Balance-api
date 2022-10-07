const Networks = require('../Models/network.js');
var mongoose = require('mongoose');
var Constant = require('../common/Constant');
const Web3 = require('web3');
const TronWeb = require('tronweb')
const axios = require('axios')
var stringify = require('json-stringify-safe');
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
        console.log("error",error)
        return { "status": 400, "balance": 0, "format_balance": 0 }
    }
}

module.exports =
{
    
    async create_or_update_network(req, res) {
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
        try {
            let networkdetails = await Networks.findOne({ "network": req.body.network, "coin": req.body.coin })
            if (networkdetails == null) {
                let balanceData = {}
                balanceData["status"] = 400
                balanceData["message"] = "Does not support this network : " + req.body.network
                return res.json(balanceData)
            }

            if (networkdetails.libaraytype == "Web3") {
                const WEB3 = new Web3(new Web3.providers.HttpProvider(networkdetails.nodeurl))
                if (networkdetails.contractaddress != "") {
                    const contract = new WEB3.eth.Contract(Constant.USDT_ABI, networkdetails.contractaddress);
                    balance = await contract.methods.balanceOf(req.body.address.toLowerCase()).call();
                    let decimals = await contract.methods.decimals().call();
                    format_balance = balance / (1 * 10 ** decimals)
                    let balanceData = {}
                    let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                    balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                    balanceData["status"] = 200
                    return res.json(balanceData)
                }
                balance = await WEB3.eth.getBalance(req.body.address.toLowerCase())
                format_balance = await Web3.utils.fromWei(balance.toString(), 'ether')
                let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                let balanceData = {}
                balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                balanceData["status"] = 200
                return res.json(balanceData)
            }
            else if (networkdetails.libaraytype == "Tronweb") {
                console.log(networkdetails.nodeurl)
                const tronWeb = new TronWeb(networkdetails.nodeurl, networkdetails.nodeurl, networkdetails.nodeurl, req.body.address);
                let contract = await tronWeb.contract().at(networkdetails.contractaddress);
                balance = await contract.balanceOf(req.body.address).call();
                format_balance = tronWeb.toBigNumber(balance)
                format_balance = tronWeb.toDecimal(format_balance)
                format_balance = tronWeb.fromSun(format_balance)
                format_balance = tronWeb.toBigNumber(format_balance)
                format_balance = tronWeb.toDecimal(format_balance)
                let balanceData = {}
                let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                balanceData[variable] = { "balance": balance, "format_balance": format_balance }
                balanceData["status"] = 200
                return res.json(balanceData)
            }
            else if (networkdetails.libaraytype == "BTC") {
                let networkdetails = await Networks.findOne({ "network": req.body.network, "coin": req.body.coin })
                let data = await Check_BTC_Balance(req.body.address)
                let balanceData = {}
                let variable = networkdetails.coin + "-" + networkdetails.network + "-" + networkdetails.id
                balanceData[variable] = data
                balanceData["status"] = 200
                return res.json(balanceData)
            }
        }
        catch (error) {
            console.log("error", error)
            let balanceData = {}
            balanceData["variable"] = { "balance": balance, "format_balance": format_balance }
            balanceData["status"] = 400
            return res.json(balanceData)

        }
    }

}