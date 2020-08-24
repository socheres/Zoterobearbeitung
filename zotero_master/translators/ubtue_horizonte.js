{
	"translatorID": "56bb8665-5518-4e95-81bd-15129ceb629e",
	"label": "ubtue_horizonte",
	"creator": "Timotheus Kim",
	"target": "https?://periodicos\\.pucminas\\.br/index\\.php/horizonte/issue|article/view",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 70,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-08-24 12:04:27"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Universitätsbibliothek Tübingen.  All rights reserved.
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

// attr()/text() v2
function attr(docOrElem ,selector ,attr ,index){ var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector); return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){ var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector); return elem?elem.textContent:null; }

function detectWeb(doc, url) {
	if (url.includes('/article/')) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.media-heading a');
	for (let row of rows) {
		var href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); 	// Embedded Metadata
	translator.setHandler('itemDone', function (obj, item) {
		let volumeIssueEntry = text(doc, '.title'); // Z.debug(volumeIssueEntry)
		item.volume = volumeIssueEntry.split(',')[0].replace('v.', '');
		item.issue = volumeIssueEntry.split(',')[1].replace('n.', '');
		if (item.pages) {
			let firstandlastpages = item.pages.split('-');
			if (firstandlastpages[0] === firstandlastpages[1]) item.pages = firstandlastpages[0];
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://periodicos.pucminas.br/index.php/horizonte/issue/view/1067",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://periodicos.pucminas.br/index.php/horizonte/article/view/P.2175-5841.2018v16n51p1023",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Contribuição da teoria de Bakhtin ao estudo das linguagens da religião",
				"creators": [
					{
						"firstName": "Antonio Carlos de Melo",
						"lastName": "Magalhães",
						"creatorType": "author"
					}
				],
				"date": "2018/12/31",
				"DOI": "10.5752/P.2175-5841.2018v16n51p1023",
				"ISSN": "2175-5841",
				"abstractNote": "The article proposes in dialogue with the Bakhtin’s theory an interpretation of the religion as infinity of possibilities. The concepts of dialogism, polyphony and unfinalibility criticize the reducionistic theories of the languages of religion. The perspective based on the Bakhtin’s theory opens  horizon  meaning  for interpretation of languages  of religion  that inhabit the chaos-world as place of religious experiences  which characteristics are the poiesis  and the concrete situations, that  originate  the singularities  in the languages  of religions. Dialogism as a theory of culture and as a philosophy of life, polyphony as theory of novels and unfinalibility as a theory of history constitute the theoretical approach of an interpretation of languages of religion in their processes, future making and cultural transformation.",
				"issue": "51",
				"journalAbbreviation": "1",
				"language": "pt;en",
				"libraryCatalog": "periodicos.pucminas.br",
				"pages": "1023",
				"publicationTitle": "HORIZONTE - Revista de Estudos de Teologia e Ciências da Religião",
				"rights": "Copyright (c) 2018 HORIZONTE - Revista de Estudos de Teologia e Ciências da Religião",
				"url": "http://periodicos.pucminas.br/index.php/horizonte/article/view/P.2175-5841.2018v16n51p1023",
				"volume": "16",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Bakhtin"
					},
					{
						"tag": "dialogismo"
					},
					{
						"tag": "linguagem"
					},
					{
						"tag": "religião"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
