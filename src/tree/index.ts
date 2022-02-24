/* eslint-disable max-classes-per-file */
import models from '../models';
import DbServices from '../services/dbServices';

const {
  Address
} = models;

const {
  getAllRecord
} = DbServices;

class Node {
  data: any;
  left: Node;
  right: Node;

  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

export class BinaryTree {
  top: Node;
  cursor: Node;
  private _length: number = 0;

  constructor(dataSet) {
    this.top = new Node(dataSet[0]);
    this.cursor = this.top;
    this._length = 1;
    for (var i = 1; i < dataSet.length; i++)
      this.insert(dataSet[i]);
  }

  insert(data) {
    this.cursor = this.top;
    while (true) {
      if (this.min(data, this.cursor.data) == data) {
        if (this.cursor.left == null) {
          this.cursor.left = new Node(data);
          this.cursor = this.top;
          this._length++;
          break;
        }
        else this.cursor = this.cursor.left;
      }
      else {
        if (this.cursor.right == null) {
          this.cursor.right = new Node(data);
          this.cursor = this.top;
          this._length++;
          break;
        }
        else this.cursor = this.cursor.right;
      }
    }
  }

  search(data) {
    this.cursor = this.top;
    while (true) {
      if (this.cursor == null) 
        return null;
      else if (this.cursor.data == data) 
        return this.cursor;
      else if (this.min(data, this.cursor.data) == data)
        this.cursor = this.cursor.left;
      else this.cursor = this.cursor.right;
    }
  }

  min(data1, data2) {
    return data1 < data2 ? data1 : data2
  }

  get length() {
    return this._length;
  }
}

export async function getTree() {
  if(global.addressTree)
    return global.addressTree;
  else {
    let result = await getAllRecord(Address, {});
    global.addressTree = new BinaryTree(result.map(record => record.base58));
    return global.addressTree;
  }
}