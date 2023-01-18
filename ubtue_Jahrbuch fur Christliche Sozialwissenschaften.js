{
	"translatorID": "8011b266-12b6-42db-815c-95ecdc8736f2",
	"label": "ubtue_Jahrbuch für Christliche Sozialwissenschaften",
	"creator": "Timotheus Kim",
	"target": "^https?://(www\\.)?uni-muenster\\.de/Ejournals/index\\.php/jcsw",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 80,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-07-07 11:25:15"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Universitätsbibliothek Tübingen.  All rights reserved.

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

// attr()/text() v2
function attr(docOrElem ,selector ,attr ,index){ var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector); return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){ var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector); return elem?elem.textContent:null; }

function detectWeb(doc, url) {
	if (url.match(/\/issue\/view/) && getSearchResults(doc))
		return "multiple";
}

function getSearchResults(doc) {

	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "pages", " " ))] | //*[contains(concat( " ", @class, " "), concat( " ", "title", " " ))]//a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function postProcess(doc, item) {
	let authors = ZU.xpath(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "name", " " ))]');
	if (item.creators.length===0) {
		for (let author of authors) {
			item.creators.push(ZU.cleanAuthor(author.textContent, "author"));
		}
	}
	item.title = item.title.replace(' | Jahrbuch für Christliche Sozialwissenschaften', '');
	item.volume = text(doc, '#pkp_content_main .title').trim();Z.debug(item.volume)
	item.volume = item.volume.substr(3, 4).replace('\(', '');
	item.DOI = text(doc, '.doi a');
	item.date = text(doc, '#pkp_content_main .title').trim();
	item.date = item.date.match(/\(\d{1,4}\)/)[0].replace(/\(/, '').replace(/\)/, '');
	item.abstractNote = text(doc, '#pkp_content_main p');
	if (!item.abstractNote) item.abstractNote = text(doc,'.abstract');
	if (item.abstractNote) item.abstractNote = item.abstractNote.replace('Zusammenfassung', '').replace('Abstract', '\n\n').replace('[Abstract fehlt]', '');
	let tagentry = text(doc, '.keywords .value');
	if (tagentry){
		let tags = tagentry.split(/\s*,\s*/);
			for (var i in tags){
			item.tags.push(tags[i].replace(/^\w/gi,function(m){return m.toUpperCase();}).trim());
		}
	}
	let rowpages = doc.querySelectorAll('.Z3988');
	for (let rowpage of rowpages) {
		var pagestext = rowpage.title;
		let pagesregexone = /\d{1,3}\+%E2%80%93\+\d{1,3}/;
		let pagesregextwo = /rft\.pages=\d+-\d+/;
		// Band 55 ohne Bindestrich
		let pagesregexthree = /\d{1,3}%E2%80%93\d{1,3}/; 
		let pagesregexnull = /Z39/;
		if (pagestext && pagestext.match(pagesregexone)) {
			item.pages = pagestext.match(pagesregexone)[0].replace(/\+%E2%80%93\+/, '-').replace(/^0+/, '').replace(/-0+/, '-');
		} else if (pagestext.match(pagesregextwo)) {
			item.pages = pagestext.match(pagesregextwo)[0].replace(/rft\.pages=/, '').replace(/^0+/, '').replace(/-0+/, '-');
		} else if (pagestext.match(pagesregexthree)) {
			item.pages = pagestext.match(pagesregexthree)[0].replace(/%E2%80%93/, '-').replace(/^0+/, '').replace(/-0+/, '-');
		} else {
			item.pages = pagestext.match(pagesregexnull)[0].replace(/Z39/, '').replace(/^0+/, '').replace(/-0+/, '-');
		}
	}
	item.ISSN = "2196-6265";
	
	/*item.date = text(doc, '.published .value');
	var dateregex = /rft\.date=\d{1,4}-\d{1,2}-\d{1,2}/;
	for (let rowpage of rowpages) {
		if (!item.date && pagestext.match(dateregex)) {
		item.date = pagestext.match(dateregex)[0].replace(/rft\.date=/, '');
		}
	}*/
	
	item.itemType = "journalArticle";
	item.complete();
}

function invokeEMTranslator(doc) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function (t, i) {
		postProcess(doc, i);
	});
	translator.translate();
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, invokeEMTranslator);
		});
	} else invokeEMTranslator(doc, url);
}

