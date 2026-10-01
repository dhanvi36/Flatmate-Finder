const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
    "_mongodb._tcp.cluster0.pneqn3m.mongodb.net",
    (err, addresses) => {

        if (err) {
            console.log("DNS ERROR:");
            console.log(err);
        } else {
            console.log("DNS WORKS:");
            console.log(addresses);
        }

    }
);