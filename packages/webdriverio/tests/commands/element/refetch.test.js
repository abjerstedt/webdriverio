import request from 'request'
import { remote } from '../../../src'
import {ELEMENT_KEY} from "../../../src/constants";

describe('refetch', () => {
    let browser

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
    });

    it('should be able to refetch a direct non chained element', async () =>{
        const elem = await browser.$('#foo')
        expect(elem.elementId).toEqual('some-elem-123');
        expect(elem.parent.capabilities).toBeDefined();

        request.mockImplementationOnce((params, cb) => {
            let value;
            switch (params.uri.path) {
            case '/wd/hub/session/foobar-123/element':
                value = 'other-elem-123';
                break;
            case `/wd/hub/session/foobar-123/element/some-elem-123/element`:
                value = 'other-elem-321';
                break;
            }
            cb(null, {
                headers: {foo: 'bar'},
                statusCode: 200,
                body: { [ELEMENT_KEY]: value }
            }, { [ELEMENT_KEY]: value });
        });

        //request.setMockResponse({ [ELEMENT_KEY]: 'other-elem-123' });

        const refetchedElem = await elem.refetch();
        console.log(refetchedElem);

        expect(refetchedElem.elementId).toEqual('other-elem-123');
        expect(refetchedElem.parent.capabilities).toBeDefined();
    });

    it('should be able to refetch a chained element', async () => {
        const elem = await browser.$('#foo')
        const subElem = await elem.$('#subfoo')
        console.log(subElem);

        expect(subElem.elementId).toEqual('some-sub-elem-321');
        expect(subElem.parent.elementId).toEqual('some-elem-123');
        expect(subElem.parent.parent.capabilities).toBeDefined();

        const refetchedSubElem = await subElem.refetch();
        console.log(refetchedSubElem);

        expect(refetchedSubElem.elementId).toEqual('some-sub-elem-321');
        expect(refetchedSubElem.parent.elementId).toEqual('some-elem-123')
        expect(refetchedSubElem.parent.parent.capabilities).toBeDefined();
    });

    afterEach(() => {
        request.mockClear()
    })
})
