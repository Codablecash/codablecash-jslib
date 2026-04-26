import { ScPrivateKey } from "../../../base/ecda/ScPrivateKey"
import { Secp256k1CompressedPoint } from "../../../base/ecda/Secp256k1CompressedPoint";
import { Secp256k1Point } from "../../../base/ecda/Secp256k1Point";
import { MuSigBuilder } from "../../../base/musig/MuSigBuilder";
import { SimpleMuSigSigner } from "../../../base/musig/SimpleMuSigSigner";


describe('Musig test', () => {
    it('case01', () => {
        let key01 = new ScPrivateKey();
        let key02 = new ScPrivateKey();

        let builder = new MuSigBuilder();
        builder.addSigner(new SimpleMuSigSigner(key01.getKeyvalue()));
	    builder.addSigner(new SimpleMuSigSigner(key02.getKeyvalue()));

        let datastr = "dasdasflgjk;lfdjgk;ldfgjioviypiyvoucsormi;umguarce,@gaopcpopcxrufnkxeyfyen";

        let data = new TextEncoder().encode(datastr);
        let length = data.length;

        let modp = Secp256k1Point.n;

        // sign
        let sig = builder.sign(data, length);

        let list = builder.getSigners();
        const maxLoop = list.size();
        for(let i = 0; i != maxLoop; ++i){
            let signer = list.get(i);
            let Xi = signer.getxG();

            sig.addXi(Xi);

            // compressed test
            let point = Secp256k1CompressedPoint.compress(Xi);
            let Xi2 = point.decompress();

            let bl = Xi.equals(Xi2);
            expect(bl).toBe(true);
        }

        let bl = sig.verify(data, length);
        expect(bl).toBe(true);
    })

})
