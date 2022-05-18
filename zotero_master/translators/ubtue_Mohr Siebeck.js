{
	"translatorID": "30f0052d-e8fc-45ac-a1db-7a729f0da376",
	"label": "ubtue_Mohr Siebeck",
	"creator": "Madeesh Kannan",
	"target": "https?://www.mohrsiebeck.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 90,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-01-13 10:55:19"
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
	if (url.match(/\/arti((cle)|(kel))\//)) {
		return "journalArticle";
	} else if (url.match(/\/((journal)|(heft)|(issue))\//) ||
		ZU.xpath(doc, '//h2[contains(@class, "issue-article-h2")]//a').length > 0) {
		return "multiple";
 	}
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h2[contains(@class, "issue-article-h2")]//a')
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
	let subtitle = ZU.xpathText(doc, '//h2[@class="droidserif20 product-detail-h2"]');
	if (subtitle) item.title = item.title + ': ' + subtitle;
	if (!item.abstractNote)
		item.abstractNote = ZU.xpathText(doc, '//div[@id="previewShort"]');

	item.tags = ZU.xpath(doc, '//div[@id="productKeywords"]//a').map(i => i.textContent.trim());

	if (item.creators.length) item.creators = ZU.xpathText(doc, '//h2[contains(@class, "product-heading-author-block")]').split(",").map(i => ZU.cleanAuthor(i));

	if (!item.language)
		item.language = ZU.xpathText(doc, '//meta[@name="language"]/@content');
}

function invokeCoinsTranslator(doc, url) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("05d07af9-105a-4572-99f6-a8e231c0daef");
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
			ZU.processDocuments(articles, invokeCoinsTranslator);
		});
	} else
		invokeCoinsTranslator(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.mohrsiebeck.com/artikel/machtkonstellationen-jenseits-von-realismus-und-idealismus-101628003181516x14791276269803",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Machtkonstellationen: Jenseits von Realismus und Idealismus",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Zenkert"
					}
				],
				"date": "2016",
				"DOI": "10.1628/003181516X14791276269803",
				"ISSN": "0031-8159",
				"abstractNote": "Claudia Horst: Marc Aurel. Philosophie und politische Macht zur Zeit der Zweiten Sophistik. Franz Steiner Verlag. Stuttgart 2013. 232 S. Herfried Münkler/Rüdiger Voigt/Ralf Walkenhaus (Hg.): Demaskierung der Macht. Niccolò Machiavellis Staats- und Politikverständnis. Nomos. 2. Auflage. Baden-Baden 2013. 224 S. Dietrich Schotte: Die Entmachtung Gottes durch den Leviathan. Thomas Hobbes über die Religion. Frommann-Holzboog. Stuttgart-Bad Cannstatt 2013. 360 S.",
				"issue": "3",
				"language": "de",
				"libraryCatalog": "ubtue_Mohr Siebeck",
				"pages": "195-206",
				"publicationTitle": "Philosophische Rundschau (PhR)",
				"shortTitle": "Machtkonstellationen",
				"volume": "63",
				"attachments": [
					{
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.mohrsiebeck.com/artikel/salvaging-the-scriptures-for-us-101628ec-2020-0033?no_cache=1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Salvaging the Scriptures for Us: The Authoritative Scriptures and Social Identity in the Epistle of Barnabas",
				"creators": [
					{
						"firstName": "Katja",
						"lastName": "Kujanpää"
					}
				],
				"date": "2020",
				"DOI": "10.1628/ec-2020-0033",
				"ISSN": "1868-7032",
				"abstractNote": "Dieser Artikel betrachtet die Beziehungen zwischen Identitätsbildung und Autorität der jüdischen Schrift im Barnabasbrief. Mit Hilfe sozialpsychologischer Theorien unter dem Sammelbegriff des social identity approach wird beleuchtet, wie der Verfasser des Briefes die Identität seiner Leserschaft in eine solche Richtung gestaltet, dass alles Jüdische unvereinbar mit ihrer »wahren« Identität erscheint. Er versucht, das jüdische Schriftverständnis (und damit die jüdische Lebensweise) als zutiefst fehlerhaft darzustellen, während er Christen als die Erben aller Verheißungen der Schrift bezeichnet. Der Artikel untersucht die verschiedenen Strategien, die der Barnabasbrief bei der Schriftauslegung verwendet, um gleichzeitig zwei Ziele zu erreichen: die Schrift zu »dejudaisieren« und ihre Autorität und Relevanz für die Leserschaft zu bewahren.",
				"issue": "4",
				"language": "de",
				"libraryCatalog": "ubtue_Mohr Siebeck",
				"pages": "475-495",
				"publicationTitle": "Early Christianity (EC)",
				"shortTitle": "Salvaging the Scriptures for Us",
				"volume": "11",
				"attachments": [
					{
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Apostolic Fathers"
					},
					{
						"tag": "Epistle of Barnabas"
					},
					{
						"tag": "Social Identity"
					},
					{
						"tag": "scriptural argumentation"
					},
					{
						"tag": "textual authority"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.mohrsiebeck.com/artikel/der-rechtliche-rahmen-einer-kirche-im-transformationsprozess-101628zevkr-2020-0031?no_cache=1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Der rechtliche Rahmen einer Kirche im Transformationsprozess: Suchbewegungen und Ideen",
				"creators": [
					{
						"firstName": "Rainer",
						"lastName": "Mainusch"
					}
				],
				"date": "2020",
				"DOI": "10.1628/zevkr-2020-0031",
				"ISSN": "0044-2690",
				"issue": "4",
				"language": "de",
				"libraryCatalog": "ubtue_Mohr Siebeck",
				"pages": "349-406",
				"publicationTitle": "Zeitschrift für evangelisches Kirchenrecht (ZevKR)",
				"shortTitle": "Der rechtliche Rahmen einer Kirche im Transformationsprozess",
				"volume": "65",
				"attachments": [
					{
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
