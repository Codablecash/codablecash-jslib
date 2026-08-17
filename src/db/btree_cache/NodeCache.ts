import { RawLinkedList, RawLinkedListElement } from "../base/RawLinkedList";
import { AbstractTreeNode } from "../btree/AbstractTreeNode";
import { NodecacheRef } from "./NodecacheRef";

export class NodeCache {
    private numDataBuffer : number;
    private numNodeBuffer : number;

    private nodes : RawLinkedList<NodecacheRef>;
    private nodeMap : Map<number, RawLinkedListElement<NodecacheRef>>;

    private datas : RawLinkedList<NodecacheRef>;
    private datasMap : Map<number, RawLinkedListElement<NodecacheRef>>;

    constructor(numDataBuffer : number, numNodeBuffer : number){
        this.numDataBuffer = numDataBuffer;
        this.numNodeBuffer = numNodeBuffer;

        this.nodes = new RawLinkedList<NodecacheRef>();
        this.datas = new RawLinkedList<NodecacheRef>();

        this.nodeMap = new Map<number, RawLinkedListElement<NodecacheRef>>();
        this.datasMap = new Map<number, RawLinkedListElement<NodecacheRef>>();
    }

    public clear() {
        while(this.nodes.size() != 0){
            this.nodes.removeByIndex(0);
        }
        this.nodeMap.clear();

        while(this.datas.size() != 0){
            this.datas.removeByIndex(0);
        }
        this.datasMap.clear();
    }

    public get(fpos : number) : NodecacheRef | null {
        {
            let element = this.nodeMap.get(fpos);
            if(element != null){
                this.onCacheHit(element, this.nodes);
                return element.data;
            }
        }

        {
            let element = this.datasMap.get(fpos);
            if(element != null){
                this.onCacheHit(element, this.datas);
                return element.data;
            }
        }

        return null;
    }

    private onCacheHit(element : RawLinkedListElement<NodecacheRef>, list : RawLinkedList<NodecacheRef>){
        list.moveElementToTop(element);
    }

    public add(node : AbstractTreeNode) : void {
        if(node.isData()){
            this.internalAddNode(node, this.datasMap, this.datas, this.numDataBuffer);
        } else {
            this.internalAddNode(node, this.nodeMap, this.nodes, this.numNodeBuffer);
        }
    }

    private internalAddNode(node : AbstractTreeNode, map : Map<number, RawLinkedListElement<NodecacheRef>>
        , list : RawLinkedList<NodecacheRef>, max : number) {
        let ref = new NodecacheRef(node);
        let element = list.__add(0, ref);

        let fpos = node.getFpos();
        map.set(fpos, element);

        if(list.size() > max){
            this.cacheOut(map, list);
        }
    }

    private cacheOut(map : Map<number, RawLinkedListElement<NodecacheRef>>, list : RawLinkedList<NodecacheRef>) {
        let lastIndex = list.size() - 1;

        let ref = list.get(lastIndex);
        list.removeByIndex(lastIndex);

        let fpos = ref != null ? ref.getNode().getFpos() : 0;
        map.delete(fpos);

        // removeCacheRef()
    }

    public remove(ref : NodecacheRef) {
        if(ref.getNode().isData()){
            this.internalRemove(ref.getNode(), this.datasMap, this.datas);
        }
        else {
            this.internalRemove(ref.getNode(), this.nodeMap, this.nodes);
        }
    }

    private internalRemove(node : AbstractTreeNode, map : Map<number, RawLinkedListElement<NodecacheRef>>, list : RawLinkedList<NodecacheRef>) {
        let fpos = node.getFpos();

        let element = map.get(fpos);
        map.delete(fpos);

        if(element != null){ // guard
            list.removeElement(element);
        }
        
        // removeCachedRef
    }
}

