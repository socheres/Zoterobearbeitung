{
	"translatorID": "9e186c48-48e4-4cbc-be69-289bda8359ad",
	"label": "ubtue_JEAC",
	"creator": "Madeesh Kannan",
	"target": "https?://jeac.de/ojs/index.php",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-11-03 14:50:26"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Universitätsbibliothek Tübingen.  All rights reserved.

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


function detectWeb(doc, url) {
	if (url.match(/\/issue\/view\//))
		return "multiple";
	else if (url.match(/\/article\/view\//)) {
		// placeholder, actual type determined by the OJS translator
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[@class="media-heading"]//a')
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
	var authors = ZU.xpath(doc, '//div[@class="authors"]//strong')
	if (item.creators.length < authors.length)
		item.creators = authors.map(i => ZU.cleanAuthor(i.textContent.trim(), 'author'));

	if (!item.abstractNote)
		item.abstractNote = ZU.xpathText(doc, '//div[@class="article-abstract"]');
	if (item.title.match(/^rezension\s?zu:?|review\s?of:?/i)) item.tags.push("RezensionstagPica");
	item.journalAbbreviation = "JEAC"
}

function invokeOJSTranslator(doc, url) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("99b62ba4-065c-4e83-a5c0-d8cc0c75d388");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function (t, i) {
		postProcess(doc, i);
		i.complete();
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
			ZU.processDocuments(articles, invokeOJSTranslator);
		});
	} else
		invokeOJSTranslator(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://jeac.de/ojs/index.php/jeac/article/view/296",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Susan Wessel, On Compassion, Healing, Suffering, and the Purpose of the Emotional Life (Reading Augustine series)",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Trettel",
						"creatorType": "author"
					}
				],
				"date": "2020/10/31",
				"DOI": "10.25784/jeac.v2i0.296",
				"ISSN": "2627-6062",
				"journalAbbreviation": "JEAC",
				"language": "en",
				"libraryCatalog": "jeac.de",
				"pages": "84-85",
				"publicationTitle": "Journal of Ethics in Antiquity and Christianity",
				"rights": "Copyright (c) 2020 Journal of Ethics in Antiquity and Christianity",
				"shortTitle": "Review of",
				"url": "https://jeac.de/ojs/index.php/jeac/article/view/296",
				"volume": "2",
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
						"tag": "Augustine"
					},
					{
						"tag": "Emotionen"
					},
					{
						"tag": "Ethik"
					},
					{
						"tag": "Ethik in Antike und Christentum"
					},
					{
						"tag": "Ethik und Emotionen"
					},
					{
						"tag": "Freude"
					},
					{
						"tag": "Leiden"
					},
					{
						"tag": "Mitleid"
					},
					{
						"tag": "RezensionstagPica"
					},
					{
						"tag": "Stoizismus"
					},
					{
						"tag": "Susan Wessel"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
