{
	"translatorID": "68643a57-3182-4e27-b34a-326347044d89",
	"label": "ubtue_Oxford Academic",
	"creator": "Madeesh Kannan",
	"target": "^https?://academic.oup.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-03-04 15:55:54"
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
	if (url.match(/\/issue\/[0-9]+\/[0-9]+/))
		return "multiple";
	else if (url.match(/\/article\/[0-9]+\/[0-9]+/)) {
		// placeholder, actual type determined by the embedded metadata translator
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, "//div[contains(@class, 'al-article-items')]/h5[contains(@class, 'item-title')]/a")
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function invokeEmbeddedMetadataTranslator(doc, url) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function (t, i) {
		// update abstract from the webpage as the embedded data is often incomplete
		var abstractText = ZU.xpathText(doc, '//section[@class="abstract"]');
		if (abstractText) i.abstractNote = abstractText;
		var tagreview = ZU.xpathText(doc, '//*[(@id = "ContentTab")]//a')
		if (tagreview.match(/Reviews|Book Reviews/i)) delete i.abstractNote;
		if (tagreview.match(/Reviews|Book Reviews/i)) i.tags.push('RezensionstagPica');
		if (ZU.xpathText(doc, '//i[@class="icon-availability_open"]/@title') != null) {
			if (ZU.xpathText(doc, '//i[@class="icon-availability_open"]/@title').match(/open access/i)) {
				i.notes.push("LF:");
			}
		}
		else if (ZU.xpathText(doc, '//i[@class="icon-availability_free"]/@title') != null) {
			if (ZU.xpathText(doc, '//i[@class="icon-availability_free"]/@title').match(/free/i)) {
				i.notes.push("LF:");
			}
		}
		let orcid = 'lala';
		let author_information_tags = ZU.xpath(doc, '//div[contains(@class,"authorInfo_OUP_ArticleTop_Info_Widget")]');
		for (let a = 0; a < author_information_tags.length; a++) {
			if (ZU.xpathText(author_information_tags[a], './/div[@class="info-card-location"]') != null) {
				let orcid = ZU.xpathText(author_information_tags[a], './/div[@class="info-card-location"]').trim();
				orcid = orcid.replace('https://orcid.org/', '');
				let author = ZU.xpathText(author_information_tags[a], './/div[@class="info-card-name"]').trim();
				i.notes.push({note: "orcid:" + orcid + ' | ' + author});
			}
		}
		if (ZU.xpathText(doc, '//div[contains(@class, "pub-date")]')) {
			if (ZU.xpathText(doc, '//div[contains(@class, "pub-date")]').match(/\d{4}/)) {
				i.date = ZU.xpathText(doc, '//div[contains(@class, "pub-date")]').match(/\d{4}/)[0];
			}
		}
		if (ZU.xpathText(doc, '//div[@class="ww-citation-primary"]/a')) {
			i.url = ZU.xpathText(doc, '//div[@class="ww-citation-primary"]/a')
		}
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
			ZU.processDocuments(articles, invokeEmbeddedMetadataTranslator);
		});
	} else
		invokeEmbeddedMetadataTranslator(doc, url);
}



/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://academic.oup.com/jss/article/65/1/245/5738633",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nevada Levi Delapp, Theophanic “Type-Scenes” in the Pentateuch: Visions of YHWH",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Savran",
						"creatorType": "author"
					}
				],
				"date": "2020/04/01",
				"DOI": "10.1093/jss/fgz049",
				"ISSN": "0022-4480",
				"issue": "1",
				"journalAbbreviation": "J Semit Stud",
				"language": "en",
				"libraryCatalog": "academic.oup.com",
				"pages": "245-246",
				"publicationTitle": "Journal of Semitic Studies",
				"shortTitle": "Nevada Levi Delapp, Theophanic “Type-Scenes” in the Pentateuch",
				"url": "https://academic.oup.com/jss/article/65/1/245/5738633",
				"volume": "65",
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
						"tag": "RezensionstagPica"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://academic.oup.com/ijtj/issue/17/2",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://academic.oup.com/bjc/article/64/2/257/7222129",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Confronting intergenerational harm: Care experience, motherhood and criminal justice involvement",
				"creators": [
					{
						"firstName": "Claire",
						"lastName": "Fitzpatrick",
						"creatorType": "author"
					},
					{
						"firstName": "Katie",
						"lastName": "Hunter",
						"creatorType": "author"
					},
					{
						"firstName": "Julie",
						"lastName": "Shaw",
						"creatorType": "author"
					},
					{
						"firstName": "Jo",
						"lastName": "Staines",
						"creatorType": "author"
					}
				],
				"date": "2024",
				"DOI": "10.1093/bjc/azad028",
				"ISSN": "0007-0955",
				"abstractNote": "Prior research highlights how criminalized mothers may be particularly at risk of negative judgements, but little work to date explores how criminalisation, care experience and motherhood may intersect to produce multi-faceted structural disadvantage within both systems of care and punishment. This paper attends to this knowledge gap, drawing on interviews with imprisoned women who have been in care (e.g. foster care or children’s homes), care-experienced girls and young women in the community, and professionals who work with them. Key findings include: a desire to break cycles of intergenerational stigma and social care involvement; lack of support and a fear of asking for help, and the care-less approach to pregnancy and motherhood that may be faced in prison and beyond.",
				"issue": "2",
				"journalAbbreviation": "Br J Criminol",
				"language": "en",
				"libraryCatalog": "academic.oup.com",
				"pages": "257-274",
				"publicationTitle": "The British Journal of Criminology",
				"shortTitle": "Confronting intergenerational harm",
				"url": "https://doi.org/10.1093/bjc/azad028",
				"volume": "64",
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
				"tags": [],
				"notes": [
					"LF:",
					{
						"note": "orcid:0000-0003-4662-2342 | Claire Fitzpatrick"
					},
					{
						"note": "orcid:0000-0001-7811-5666 | Katie Hunter"
					},
					{
						"note": "orcid:0000-0002-0192-178X | Julie Shaw"
					},
					{
						"note": "orcid:0000-0001-7285-496X | Jo Staines"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
