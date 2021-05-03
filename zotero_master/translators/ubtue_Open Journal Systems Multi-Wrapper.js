{
	"translatorID": "b60e74db-2e5d-4b2a-94ac-f484737364b1",
	"label": "ubtue_Open Journal Systems Multi-Wrapper",
	"creator": "Madeesh Kannan",
	"target": "/(article|issue)/(view)?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-10-05 12:34:30"
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
	if (url.match(/\/issue\/view/) && getSearchResults(doc))
		return "multiple";
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[contains(@href, "/article/view/") and not(contains(@href, "/pdf"))]')
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);

		if (!href || !title)
			continue;
		if (title.match(/PDF|EPUB|XML|HTML|Download Full Text/i))
			continue;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function invokeBestTranslator(doc, url) {
	var translator = Zotero.loadTranslator("web");
	translator.setDocument(doc);
	translator.setHandler("translators", function (o, valid_translators) {
		if (valid_translators && valid_translators.length > 0) {
			translator.setTranslator(valid_translators);
			translator.translate();
		}
	});
	translator.setHandler("itemDone", function (t, item) {
		if (item.issue === "0")
			item.issue = "";

		if (item.volume === "0")
			item.volume = "";
		var creatorsToDelete = []
		
		for (i=0; i<item.creators.length; i++) {
			var creatorString = item.creators[i]["firstName"] + ' ' + item.creators[i]["lastName"];
			
			if (creatorString.match("review|Review")) {
				creatorString = creatorString.substring(0, creatorString.indexOf(" ("));
				var creatorsNamesList = creatorString.split(' ');
				item.creators[i]["lastName"] = creatorsNamesList[creatorsNamesList.length - 1];
				var firstNameList = creatorString.split(' ').slice(0, creatorString.split(' ').length - 1);
				item.creators[i]["firstName"] = firstNameList.join(' ');
				item.tags.push('RezensionstagPica');
			}
			else if (creatorString.match("author|Author")) {creatorString = creatorString.substring(0, creatorString.indexOf(" ("));
				var creatorsNamesList = creatorString.split(' ');
				item.creators[i]["lastName"] = creatorsNamesList[creatorsNamesList.length - 1];
				var firstNameList = creatorString.split(' ').slice(0, creatorString.split(' ').length - 1);
				item.creators[i]["firstName"] = firstNameList.join(' ');
				item.creators[i]["creatorType"] = "reviewedAuthor";
				
			}
			else if (creatorString.match(/\(book/)) {
			creatorsToDelete.push(i);}
		}
		creatorsToDelete.reverse();
		for (d=0; d<creatorsToDelete.length; d++) {
			item.creators.splice(creatorsToDelete[d], 1);
		}
		
		
		item.complete();
	});
	translator.getTranslators();
}

function doWeb(doc, url) {
	let items = getSearchResults(doc);
	if (items) {
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			let articles = [];
			for (let i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, invokeBestTranslator);
		});
	} else {
		// attempt to skip landing pages for issues.
		let tocLinks = ZU.xpath(doc, '//a[contains(@href, "/issue/view/") and not(contains(@href, "/pdf"))]')
		for (let entry in tocLinks) {
			let link = tocLinks[entry].href;
			if (link.match(/\/issue\/view\/\d+\/showToc$/i)) {
				ZU.processDocuments([link], invokeBestTranslator);
				break;
			}
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.zwingliana.ch/index.php/zwa/article/view/2517",
		"items": "multiple"
	}
]
/** END TEST CASES **/
