import { EchoServerDataListner } from "../../../blockchain_p2p/ipconnect/EchoServerDataListner";
import { IpClientConnection } from "../../../blockchain_p2p/ipconnect/IpClientConnection";
import { IpV4ServerConnection } from "../../../blockchain_p2p/ipconnect/IpV4ServerConnection";


describe('Client Connection test', () => {
    test('IP v4 server and client', async () => {
        const ipv4Server = new IpV4ServerConnection(new EchoServerDataListner());
        ipv4Server.initAddress("127.0.0.1", 6543);
        await ipv4Server.listen();

        try{
            const client = new IpClientConnection();

            await client.connect("127.0.0.1", 6543);

            let str = "Hello world.";
            const uint8Array = new TextEncoder().encode(str);
            client.write(uint8Array);

            let buff = await client.read();

            let str2 = buff.toString();
            expect(str2).toBe("Echo " + str);

            client.close();
        }
        catch(exceptionVar){
            console.log(exceptionVar);
        }

        await ipv4Server.close();
    });

})
