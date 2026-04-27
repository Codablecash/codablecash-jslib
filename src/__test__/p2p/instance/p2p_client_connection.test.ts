import { IpV4ServerConnection } from "../../../blockchain_p2p/ipconnect/IpV4ServerConnection";


describe('Client Connection test', () => {
    test('IP v4 server and client', async () => {
        const ipv4Server = new IpV4ServerConnection();
        ipv4Server.initAddress("127.0.0.1", 6543);
        await ipv4Server.listen();

        

        ipv4Server.close();
    });

})
