import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { Category } from 'src/app/interfaces/category';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  @ViewChild('catModal') modal: IonModal;
  @Output() addCategoryEvent = new EventEmitter<any>()
  @Input() categoryList
  newCat = true
  category: Category = {
    category:"",
    color:"#fff"
  }

  showColorPicker = false
  showEmptyMsg = false
  showUsedMsg = false
  showUsedOnEdit = false
  titleText = {
    new:"Añadir categoría",
    edit:"Editar categoría"
  }
  labelText = {
    new:"Nueva categoría",
    edit:"Categoría"
  }
  actualTitle
  actualLabel
  initialCategoryName = ""
  prevCategory: string;

  constructor(public config: ConfigService, public storageService: StorageService) {
    //this.loadCategories()
  }

  ngOnInit() {
    this.setTexts()
  }


  setToNewFunction(){
    this.newCat = true
    this.initialCategoryName = ""
    this.setTexts()
    this.resetValues()
  }

  setToEditFunction(category: Category){
    this.newCat = false
    this.setTexts()
    this.category = {...category}
    console.log(this.category)
    this.initialCategoryName = category.category
  }


  setTexts(){
    if(this.newCat){
      this.actualTitle = this.titleText.new
      this.actualLabel = this.labelText.new
    } else {
      this.actualTitle = this.titleText.edit
      this.actualLabel = this.labelText.edit
    }
  }

  selectColor(color){
    this.category.color = color
  }

  async loadCategories(){
    //this.categoryList = await this.storageService.getData("categories")
  }

  async saveCategory(){
    if(this.validateCategory()){
      if(this.newCat){
        console.log('new cat')
        //var arr = await this.storageService.addData('categories',this.category)
        var arr = await this.storageService.addCategories(this.category)
        console.log(arr.slice(-1)[0])
      } else {
        //console.log('enter on save edit: ',this.category)
        //await this.storageService.editItemByID('categories',this.category)
        await this.storageService.editCategories(this.category,this.initialCategoryName)
      }
      this.addCategoryEvent.emit()
      this.loadCategories()
      this.modal.dismiss()
    }
  }

  validateCategory(){
    this.showEmptyMsg = this.category.category == ""
    this.showUsedMsg = this.categoryList.find((cat) => cat.category == this.category.category) != undefined && this.newCat
    this.showUsedOnEdit = this.categoryList.find((cat) => {
      cat.category == this.category.category && this.category.category != this.initialCategoryName
    }) != undefined && !this.newCat
    console.log('showEmptyMsg: ',this.showEmptyMsg)
    console.log('showUsedMsg: ',this.showUsedMsg)
    console.log('showUsedOnEdit: ',this.showUsedOnEdit)
    return !(this.showEmptyMsg || this.showUsedMsg || this.showUsedOnEdit)
  }

  resetValues(){
    this.category = {
      category:"",
      color:"#fff"
    }
    this.initialCategoryName = ""
    this.showEmptyMsg = false
    this.showUsedMsg = false
    this.showUsedOnEdit = false
  }

}
