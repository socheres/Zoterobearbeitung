{
	"translatorID": "65478237-ad95-4928-a663-508f0dfe84aa",
	"label": "ubtue_erhizome",
	"creator": "Helena Nebel",
	"target": "www.e-rhizome.upol.cz/(magno|artkey)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 80,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2022-12-19 10:04:48"
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

function detectWeb(doc, url) {
	if (url.match(/\/magno\//) && getSearchResults(doc)) return "multiple";
		else if (url.match(/\/artkey\//)) {
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[contains(@href, "/artkey/erh")]');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(ZU.xpathText(row, './/h3[@class="articleTitle"]'));
		if (!href || !title) continue;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function postProcess(doc, item) {
	// tagentry for 2309-9089 Acta Theologica
	let tagentry = ZU.xpathText(doc,'//*[contains(concat( " ", @class, " " ), concat( " ", "keywords", " " ))]//*[contains(concat( " ", @class, " " ), concat( " ", "value", " " ))]');
	   	if (tagentry) {
			let tags = tagentry.split(/\s*,|;\s*/);Z.debug(tags)
			for (let i in tags){
				item.tags.push(tags[i].replace(/^\w/gi,function(m){return m.toUpperCase();}));
		}
	}
	item.complete();
}

function invokeEMTranslator(doc) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function (t, i) {
		postProcess(doc, i);
		//i.complete();
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
	} else
		invokeEMTranslator(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
