import logger from "../utils/logger";
import utils from "../utils/utils"
import {setEnabledColorMenu} from "../modals/modals"

export default {
  getLibById,
  initLibsSelectList,
  getColorFromSymbol,
  getSymbolFromDocument,
  loadLibrary
}

/**
 * @name getLibById
 * @description return library by id
 * @param libraryId
 * @returns {Object} : MSAssetLibrary
 */
function getLibById(libraryId) {

  let library, availableLibraries = AppController.sharedInstance().librariesController().availableLibraries()

  for(let i = 0; i < availableLibraries.length; i++){
    if(String(libraryId) === String(availableLibraries[i].libraryID())){
      library = availableLibraries[i]
      break;
    }
  }

  return library
}

/**
 * @name loadColorFromSelectedLib
 * @description get colors form library selected
 * @param library
 * @param colorMenu
 * @returns {Array}
 */
function loadColorFromSelectedLib(library, colorMenu) {

  colorMenu.removeAllItems()
  library = library.representedObject()

  return getColorSymbolsFromDocument(library.document())
}

function loadLibrary(library){
  return library.loadSynchronously()
}

/**
 * @name initLibsSelectList
 * @description get list of library in NSMenu
 * @param context
 * @param libraries  {Array}
 * @param colorMenu {Object} : NSPopUpButton
 * @returns {Object} : NSMenu
 */
function initLibsSelectList(context, libraries, colorMenu) {

  function addListener(item) {
    item.setCOSJSTargetFunction((libraryItem) => {
      updateColorMenu.call(this, context, libraryItem, colorMenu)
    })
  }

  const colorLibsMenu = NSMenu.alloc().init()
  const currentDocument = NSMenuItem.alloc().init()
  currentDocument.title = 'Current file'
  addListener.call(this,currentDocument)
  colorLibsMenu.addItem(currentDocument)
  libraries.forEach((library) => {
    let item = NSMenuItem.alloc().init()
    item.title = library.name()
    item.representedObject = library
    colorLibsMenu.addItem(item)
    addListener.call(this,item)
  })

  updateColorMenu.call(this, context, currentDocument, colorMenu)

  return colorLibsMenu
}

function updateColorMenu(context, libraryItem, colorMenu){
  let colors = []
  if(!libraryItem.representedObject()){
    colors = getColorSymbolsFromDocument.call(this, context.document.documentData())
  }else{
    colors = loadColorFromSelectedLib.call(this, libraryItem, colorMenu)
  }
  if(colors.length > 0){
    initColorSelectList.call(this, colorMenu, colors);
    setEnabledColorMenu.call(this, true)
  }else {
    setEnabledColorMenu.call(this, false)
  }
}

/**
 * @name initColorSelectList
 * @description get list of colors in NSMenu
 * @param popColorMenu {Object} : NSPopUpMenu
 * @param colors
 * @returns {Object} : NSMenu
 */
function initColorSelectList(popColorMenu, colors) {

  const menu = NSMenu.alloc().init()

  menu.cancelTracking()

  colors.forEach(function(color){
    let item = NSMenuItem.alloc().init()
    item.title = (color.symbol) ? color.symbol.name() : ""
    let colorRGBA = (color.color) ? NSColor.colorWithRed_green_blue_alpha(color.color.red(), color.color.green(), color.color.blue(), color.color.alpha()) : NSColor.colorWithRed_green_blue_alpha(color.red(), color.green(), color.blue(), color.alpha())
    item.representedObject = (color.symbol)  ? color.symbol : colorRGBA
    item.image = utils.getImageByColor(colorRGBA)
    menu.addItem(item)
  })

  popColorMenu.menu = menu
  return popColorMenu
}

/**
 * @name getColorSymbolsFromDocument
 * @param document
 * @return {Array}
 */
function getColorSymbolsFromDocument(document){
  const result = []

  document.localSymbols().forEach(function(symbol){
    const color = getColorFromSymbol(symbol)
    if(color)result.push(color)
  })


  return result
}

/**
 * @name getSymbolFromDocument
 * @param document
 * @param symbolId
 * @return {*}
 */
function getSymbolFromDocument(document, symbolId){


  let symbol, localSymbols = document.localSymbols();

  for(let i = 0; i < localSymbols.length; i++){
    if(String(localSymbols[i].symbolID())=== String(symbolId)){
      symbol = localSymbols[i]
      break
    }
  }

  return symbol
}

/**
 * @name getColorFromSymbol
 * @param symbol
 * @return {*}
 */
function getColorFromSymbol(symbol){
  const layers = symbol.layers()
  let result

  if(layers.length === 0 && symbol.backgroundColor()){
    result = {
      color: symbol.backgroundColor(),
      symbol: symbol
    }
  }
  else if(layers.length === 1 && layers[0].children().length === 2 && layers[0].style().hasEnabledFill()){


    result = {
      color: layers[0].style().fills()[0].color(),
      symbol: symbol
    }
  }
  return result
}
