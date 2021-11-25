{
	"translatorID": "c39e9277-1b70-4340-82ae-9cd2a3692c6c",
	"label": "ubtue_Zurich Open Repository and Archive",
	"creator": "Timotheus Kim",
	"target": "^https?://www\\.zora\\.uzh\\.ch/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-11-25 15:57:34"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2021 Timotheus Kim
	
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


function detectWeb(doc, url) {
	if (url.includes('/id/')) {
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
	var rows = doc.querySelectorAll('.dreiklang_title a');
	for (let row of rows) {
		let href = row.href;
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
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (item.notes) item.notes.push({note :'orcid:' + item.orcid + ' | ' + 'taken from website'});
		for (let i of item.notes) {
			if (i.note.match(/undefined/)) delete i.note;
		}
		if (item.notes) item.notes.push({note : item.oa_status});
		if (item.tags) delete item.tags;
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = detectWeb(doc, url);
		trans.addCustomFields({
			'eprints.creators_orcid': 'orcid',
			'eprints.chair_subject' : 'tags',
			'eprints.oa_status' : 'oa_status',
		});
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.zora.uzh.ch/id/eprint/197101/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "‚Writing on the Heart‘ (Jer 31:31–34): an allusion to scribal training? a response to Joachim J. Krause",
				"creators": [
					{
						"firstName": "Konrad",
						"lastName": "Schmid",
						"creatorType": "author"
					}
				],
				"date": "2020/09/10",
				"DOI": "10.1515/zaw-2020-3006",
				"ISSN": "0044-2526",
				"issue": "3",
				"language": "eng",
				"libraryCatalog": "www.zora.uzh.ch",
				"pages": "458-462",
				"publicationTitle": "Zeitschrift für die alttestamentliche Wissenschaft",
				"rights": "info:eu-repo/semantics/openAccess",
				"shortTitle": "‚Writing on the Heart‘ (Jer 31",
				"url": "https://www.zora.uzh.ch/id/eprint/197101/",
				"volume": "132",
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
						"tag": "Altes Testament"
					}
				],
				"notes": [
					"orcid:0000-0002-8968-2604 | taken from website"
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.zora.uzh.ch/cgi/search/archive/advanced?screen=Search&dataset=archive&title_merge=ALL&title=&date%2Fevent_end=&creators_name%2Feditors_name_merge=ALL&creators_name%2Feditors_name=%22Schmid%2C+Konrad%22&creators_orcid%2Feditors_orcid=&documents_merge=ALL&documents=&abstract_merge=ALL&abstract=&keywords_merge=ALL&keywords=&doi%2Fid_number%2Fpubmedid_merge=ALL&doi%2Fid_number%2Fpubmedid=&type=article&type=book_section&type=working_paper&subjects_merge=ANY&creators_name_merge=ALL&creators_name=&editors_name_merge=ALL&editors_name=&examiners_name_merge=ALL&examiners_name=&corp_creators_merge=ALL&corp_creators=&chair_subject_merge=ALL&chair_subject=&publisher_merge=ALL&publisher=&isbn%2Fissn_merge=ALL&isbn%2Fissn=&book_title%2Fnewspaper_title_merge=ALL&book_title%2Fnewspaper_title=&citation%2Fpublication_merge=ALL&citation%2Fpublication=&series_merge=ALL&series=&volume_merge=ALL&volume=&number_merge=ALL&number=&pagerange%2Fpages=&document_availability_merge=ANY&oa_status=gold&oa_status=hybrid&oa_status=green&documents.formatdesc_merge=ALL&documents.formatdesc=&language_mult_merge=ANY&funding_reference_funder_name_merge=ALL&funding_reference_funder_name=&funding_reference_award_title_merge=ALL&funding_reference_award_title=&funding_reference_award_number_merge=ALL&funding_reference_award_number=&datestamp=&lastmod=&userid.username=&userid=&jdb_id_merge=ALL&jdb_id=&satisfyall=ALL&order=-date%2Fcreators_name%2Feditors_name%2Ftitle&_action_search=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.zora.uzh.ch/id/eprint/23300/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Manasse und der Untergang Judas: »Golaorientierte« Theologie in den Königsbüchern?",
				"creators": [
					{
						"firstName": "Konrad",
						"lastName": "Schmid",
						"creatorType": "author"
					}
				],
				"date": "1997",
				"DOI": "10.5167/uzh-23300",
				"ISSN": "0006-0887",
				"abstractNote": "The passages about Manasseh in 2Kgs21,*3-16; 23,26-27; 24,3-4 do not reflect deuteronomistic theology, even though they are couched in deuteronomistic language. They express a 'gola' theology. Statements about the guilt of the kings and people of the Northern Kingdom have been subtly changed. Manasseh alone is to blame for the destruction of Judah and Jerusalem. The events of 597 B.C., not 587 B.C., bear witness to this.",
				"issue": "1",
				"language": "deu",
				"libraryCatalog": "www.zora.uzh.ch",
				"pages": "87-99",
				"publicationTitle": "Biblica",
				"rights": "info:eu-repo/semantics/openAccess",
				"shortTitle": "Manasse und der Untergang Judas",
				"url": "http://www.bsw.org/?l=7178",
				"volume": "78",
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
				"notes": [
					{},
					{
						"note": "green"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
