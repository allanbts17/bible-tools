import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedInfoService {
  defaultBible
  defaultChapter
  bibles = []
  constructor() { }
}
