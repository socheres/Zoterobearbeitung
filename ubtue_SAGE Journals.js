{
	"translatorID": "8733528c-e083-4797-8709-a9dc335b8669",
	"label": "ubtue_SAGE Journals",
	"creator": "Sebastian Karcher",
	"target": "^https?://journals\\.sagepub\\.com(/doi/((abs|full|pdf)/)?10\\.|/action/doSearch\\?|/toc/)",
	"minVersion": "3.0",
	"maxVersion": "",
<<<<<<< HEAD
	"priority": 99,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-10-06 11:37:24"
=======
	"priority": 95,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2022-12-06 09:03:44"
>>>>>>> master
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2016 Philipp Zumstein
	Modiefied 2020 Timotheus Kim
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

// SAGE uses Atypon, but as of now this is too distinct from any existing Atypon sites to make sense in the same translator.

// attr()/text() v2
// eslint-disable-next-line
var reviewURLs = [];

function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, url) {
	if (url.includes('/abs/10.') || url.includes('/full/10.') || url.includes('/pdf/10.')) {
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
<<<<<<< HEAD
	var rows = ZU.xpath(doc, '//span[contains(@class, "art_title")]/a[contains(@href, "/doi/full/10.") or contains(@href, "/doi/abs/10.") or contains(@href, "/doi/pdf/10.")][1] | //a[contains(concat( " ", @class, " " ), concat( " ", "ref", " " )) and contains(concat( " ", @class, " " ), concat( " ", "nowrap", " " ))] | //*[contains(concat( " ", @class, " " ), concat( " ", "hlFld-Title", " " ))]');
=======
	let rows = ZU.xpath(doc, '//span[contains(@class, "art_title")]/a[contains(@href, "/doi/full/10.") or contains(@href, "/doi/abs/10.") or contains(@href, "/doi/pdf/10.")][1] | //a[contains(concat( " ", @class, " " ), concat( " ", "ref", " " )) and contains(concat( " ", @class, " " ), concat( " ", "nowrap", " " ))] | //*[contains(concat( " ", @class, " " ), concat( " ", "hlFld-Title", " " ))] | //a[(contains(@href, "/doi/abs/10.") or contains(@href, "/doi/pdf/10.")) and @data-id="toc-article-title"]');
	let new_rows = ZU.xpath(doc, '//td[@valign="top"][contains(./span[@class="ArticleType"], "Review")]');
	for (var i = 0; i < new_rows.length; i++) {
		let links = ZU.xpath(new_rows[i], './/a');
		for (var l = 0; l < links.length; l++) {
			if (links[l].href.match(/\/abs\//)) {
				reviewURLs.push(links[l].href);
				break;
			}
			
		}
	}
>>>>>>> master
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent.replace(/Citation|ePub.*|Abstract/, ''));
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		href = href.replace("/doi/pdf/", "/doi/abs/");
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

/*function postProcess(doc, item) {
	// remove partial DOIs stored in the pages field of online-first articles
	if (item.DOI) {
		var doiMatches = item.DOI.match(/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/((?:(?!["&'<>])\S)+))\b/);
		if (doiMatches) {
			var secondPart = doiMatches[2];
			if (item.pages === secondPart) item.pages = "";
		}
	}
}*/

function scrape(doc, url) {
	var risURL = "//journals.sagepub.com/action/downloadCitation";
	var doi = ZU.xpathText(doc, '//meta[@name="dc.Identifier" and @scheme="doi"]/@content');
	/*if (!doi) {
		doi = url.match(/10\.[^?#]+/)[0];
<<<<<<< HEAD
	}*/
=======
	}
>>>>>>> master
	var post = "doi=" + encodeURIComponent(doi) + "&include=abs&format=ris&direct=false&submit=Download+Citation";
	var pdfurl = "//" + doc.location.host + "/doi/pdf/" + doi;
	var articleType = ZU.xpath(doc, '//span[@class="ArticleType"]/span');//Z.debug(articleType)
	
	//Z.debug(pdfurl);
	//Z.debug(post);
	ZU.doPost(risURL, post, function (text) {
		//The publication date is saved in DA and the date first
		//appeared online is in Y1. Thus, we want to prefer DA over T1
		//and will therefore simply delete the later in cases both
		//dates are present.
		//Z.debug(text);
		if (text.includes("DA  - ")) {
			text = text.replace(/Y1[ ]{2}- .*\r?\n/, '');
		}
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
<<<<<<< HEAD
=======
		//Z.debug(translator);
>>>>>>> master
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			// The subtitle will be neglected in RIS and is only present in
			// the website itself. Moreover, there can be problems with
			// encodings of apostrophs.
			var subtitle = ZU.xpathText(doc, '//div[contains(@class, "publicationContentSubTitle")]/h1');
			var title = ZU.xpathText(doc, '//div[contains(@class, "publicationContentTitle")]/h1');
			if (title) {
				item.title = title.trim();
				if (subtitle) {
					item.title += ': ' + subtitle.trim();
				}
			}
<<<<<<< HEAD
			
			// The encoding of apostrophs in the RIS are incorrect and
			// therefore we extract the abstract again from the website.
			/*if (abstract) {
				item.abstractNote = abstract;
			}*/
			
			// ubtue: also add translated abstracts
			/*var ubtueabstract = ZU.xpathText(doc, '//article//div[contains(@class, "tabs-translated-abstract")]/p | //*[contains(concat( " ", @class, " " ), concat( " ", "abstractInFull", " " ))]');
			if (ubtueabstract) {
				item.abstractNote += "\n\n" + ubtueabstract;
			}*/
			
=======
			//if author name include "(Translator)" change creatorType and delete "(Translator" from lastName e.g. https://journals.sagepub.com/doi/full/10.1177/0040573620947051
			for (let i in item.creators) {
				let translator = item.creators[i].lastName;
				if (item.creators[i].lastName.match(/\(?Translator\)?/)) {
					item.creators[i].creatorType = "translator";
					item.creators[i].lastName = item.creators[i].lastName.replace('(Translator)', '');
				}
			}
			if (item.pages.match(/[ABCD]\d+/) != null) {
				item.pages = "";
			}
			//scrape ORCID from website e.g. https://journals.sagepub.com/doi/full/10.1177/0084672419883339
			let authorSectionEntries = doc.querySelectorAll('.author-section-div');
			for (let authorSectionEntry of authorSectionEntries) {
				let entryHTML = authorSectionEntry.innerHTML;
				let regexOrcid = /\d+-\d+-\d+-\d+x?/i;
				let regexName = /author=.*"/;
				if(entryHTML.match(regexOrcid)) {
					item.notes.push({note: "orcid:" + entryHTML.match(regexOrcid)[0] + ' | ' + entryHTML.match(regexName)[0].replace('\"', '').replace('author=', '') + ' | taken from website'});
				}
			}
			//scrape ORCID from website e.g. https://doi.org/10.1177/09518207221115929
			let newAuthorSectionEntries = ZU.xpath(doc, '//span[@property="author"]');
			for (let authorSectionEntry of newAuthorSectionEntries) {
				if (ZU.xpathText(authorSectionEntry, './a[contains(@href, "orcid")]')) {
					let orcid = ZU.xpathText(authorSectionEntry, './a[contains(@href, "orcid")]').replace(/https?:\/\/orcid.org\//, '');
					let authorName = ZU.xpathText(authorSectionEntry, './/span[@property="givenName"]') + ' ' + ZU.xpathText(authorSectionEntry, './/span[@property="familyName"]');
					item.notes.push({"note": "orcid:" + orcid + ' | ' + authorName + ' | taken from website'});
				}	
			}
			// Workaround to address address weird incorrect multiple extraction by both querySelectorAll and xpath
			// So, let's deduplicate...
			item.notes = Array.from(new Set(item.notes.map(JSON.stringify))).map(JSON.parse);
>>>>>>> master
			// ubtue: extract translated and other abstracts from the different xpath
			var ubtueabstract = ZU.xpathText(doc, '//article//div[contains(@class, "abstractSection")]/p');
			var otherabstract = ZU.xpathText(doc, '//article//div[contains(@class, "tabs-translated-abstract")]/p');
			var abstract = ZU.xpathText(doc, '//article//div[contains(@class, "abstractSection")]/p');
			if (ubtueabstract && otherabstract) {
				item.abstractNote = ubtueabstract + '\n' + otherabstract;
			} else if (ubtueabstract && !otherabstract) {
				ubtueabstract = ZU.xpathText(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "abstractInFull", " " ))]');
				item.abstractNote = ubtueabstract;
			} else {
				item.abstractNote = abstract;
			}
<<<<<<< HEAD

=======
			if (otherabstract) {
				item.notes.push({note: "abs:" + otherabstract.replace(/^Résumé/, '')});
			} 
			else if (ubtueabstract) {
				item.abstractNote = ubtueabstract;
			}
>>>>>>> master
			var tagentry = ZU.xpathText(doc, '//kwd-group[1] | //*[contains(concat( " ", @class, " " ), concat( " ", "hlFld-KeywordText", " " ))]');
			if (tagentry) {
				tagentry = tagentry.replace('Keywords', '')
				item.tags = tagentry.split(",");
			}
			// ubtue: add tags "Book Review" if "Review Article"
			if (articleType) {
				for (let r of articleType) {
<<<<<<< HEAD
					let reviewDOIlink = r.textContent;
					if (reviewDOIlink.match(/Review Article/)) {
						item.tags.push('RezensionstagPica');
					}
				}
			}
=======
					var reviewDOIlink = r.innerHTML;
					if (reviewDOIlink.match(/(product|book)\s+reviews?/i)) {
						item.tags.push('Book Review');
					} else if (reviewDOIlink.match(/article\s+commentary|review\s+article/i)) { //"Review article", "Article commentary" as Keywords
						item.tags.push(reviewDOIlink)
					}
				}
			}
			if (reviewURLs.includes(url)) {
				item.tags.push('Book Review');
			}
			//ubtue: add tag "Book Review" in every issue 5 of specific journals if the dc.Type is "others"
			let reviewType = ZU.xpathText(doc, '//meta[@name="dc.Type"]/@content');
			if (item.ISSN === '0142-064X' || item.ISSN === '0309-0892') {
				if (reviewType && reviewType.match(/other/i) && item.issue === '5') {
					item.tags.push('Book Review');
					item.notes.push({note: "Booklist:" + item.date.match(/\d{4}$/)});
					if (item.abstractNote && item.abstractNote.match(/,(?!\s\w)/g)) {
						item.abstractNote = '';	
					}
				}
			}
			if (item.abstractNote && item.abstractNote.match(/,\s(,\s*)+/g)) {
						item.abstractNote = '';	
					}
			for (let n in item.notes) {
				if (item.notes[n]['note'].match(/doi:\s/)) {
					item.notes.splice(n, 1);
				}
			}
			// numbering issues with slash, e.g. in case of  double issue "1-2" > "1/2"
			if (item.issue) item.issue = item.issue.replace('-', '/');

>>>>>>> master
			// Workaround while Sage hopefully fixes RIS for authors
			for (let i = 0; i < item.creators.length; i++) {
				if (!item.creators[i].firstName) {
					let type = item.creators[i].creatorType;
					let comma = item.creators[i].lastName.includes(",");
					item.creators[i] = ZU.cleanAuthor(item.creators[i].lastName, type, comma);
				}
			}

			// scrape tags
			if (!item.tags || item.tags.length === 0) {
				var embedded = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
				if (embedded) item.tags = embedded.split(",");
				if (!item.tags) {
					var tags = ZU.xpath(doc, '//div[@class="abstractKeywords"]//a');
					if (tags) item.tags = tags.map(n => n.textContent);
				}
			}
<<<<<<< HEAD

			if (articleType && articleType.length > 0) {
				if (articleType[0].textContent.trim().match(/Book Review/)) item.tags.push("RezensionstagPica");
			}
			
			//fix pages if RIS tag "SP" is equal to "EP" e.g. "193-193"
			let checkPages = item.pages.split('-'); //Z.debug(checkPages)
			if (checkPages[0] === checkPages[1]) item.pages = checkPages[0];
		
			item.notes = [];
			item.language = ZU.xpathText(doc, '//meta[@name="dc.Language"]/@content');
			item.attachments.push({
				url: pdfurl,
				title: "SAGE PDF Full Text",
				mimeType: "application/pdf"
			});
			//postProcess(doc, item);
=======
			// mark articles as "LF" (MARC=856 |z|kostenfrei), that are published as open access
			let accessIcon = doc.querySelector('.accessIcon[alt]');
			if (accessIcon && accessIcon.alt.match(/open\s+access/gi)) item.notes.push({note: 'LF:'});
			else if (ZU.xpathText(doc, '//i[@class="icon-open_access"]/@data-original-title') == 'Open access') item.notes.push({note: 'LF:'});
			item.language = ZU.xpathText(doc, '//meta[@name="dc.Language"]/@content');
			item.attachments = [];
			var articleType = ZU.xpathText(doc, '//span[@class="ArticleType"]');
			if (articleType != undefined) {
				if (articleType.match(/^(\s+Book\s+)?(\s+)?Review( Article)?/)) {
					item.tags.push('Book Review');
				}
			}
			item.attachments = [];
			if (item.creators.length == 0) {
				let authorName = ZU.xpathText(doc, '//meta[@name="dc.Contributor"]/@content');
				if (authorName != null) {
				item.creators.push(ZU.cleanAuthor(authorName, "author")) ;
			}
			}
>>>>>>> master
			item.complete();
		});
		translator.translate();
	});
<<<<<<< HEAD
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.sagepub.com/doi/abs/10.1177/1754073910380971",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Emotion and Regulation are One!",
				"creators": [
					{
						"firstName": "Arvid",
						"lastName": "Kappas",
						"creatorType": "author"
					}
				],
				"date": "January 1, 2011",
				"DOI": "10.1177/1754073910380971",
				"ISSN": "1754-0739",
				"abstractNote": "Emotions are foremost self-regulating processes that permit rapid responses and adaptations to situations of personal concern. They have biological bases and are shaped ontogenetically via learning and experience. Many situations and events of personal concern are social in nature. Thus, social exchanges play an important role in learning about rules and norms that shape regulation processes. I argue that (a) emotions often are actively auto-regulating—the behavior implied by the emotional reaction bias to the eliciting event or situation modifies or terminates the situation; (b) certain emotion components are likely to habituate dynamically, modifying the emotional states; (c) emotions are typically intra- and interpersonal processes at the same time, and modulating forces at these different levels interact; (d) emotions are not just regulated—they regulate. Important conclusions of my arguments are that the scientific analysis of emotion should not exclude regulatory processes, and that effortful emotion regulation should be seen relative to a backdrop of auto-regulation and habituation, and not the ideal notion of a neutral baseline. For all practical purposes unregulated emotion is not a realistic concept.",
				"issue": "1",
				"journalAbbreviation": "Emotion Review",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "17-25",
				"publicationTitle": "Emotion Review",
				"url": "https://doi.org/10.1177/1754073910380971",
				"volume": "3",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "emotion regulation"
					},
					{
						"tag": "facial expression"
					},
					{
						"tag": "facial feedback"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals.sagepub.com/toc/rera/86/3",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journals.sagepub.com/doi/full/10.1177/0954408914525387",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Brookfield powder flow tester – Results of round robin tests with CRM-116 limestone powder",
				"creators": [
					{
						"firstName": "R. J.",
						"lastName": "Berry",
						"creatorType": "author"
					},
					{
						"firstName": "M. S. A.",
						"lastName": "Bradley",
						"creatorType": "author"
					},
					{
						"firstName": "R. G.",
						"lastName": "McGregor",
						"creatorType": "author"
					}
				],
				"date": "August 1, 2015",
				"DOI": "10.1177/0954408914525387",
				"ISSN": "0954-4089",
				"abstractNote": "A low cost powder flowability tester for industry has been developed at The Wolfson Centre for Bulk Solids Handling Technology, University of Greenwich in collaboration with Brookfield Engineering and four food manufacturers: Cadbury, Kerry Ingredients, GSK and United Biscuits. Anticipated uses of the tester are primarily for quality control and new product development, but it can also be used for storage vessel design., This paper presents the preliminary results from ‘round robin’ trials undertaken with the powder flow tester using the BCR limestone (CRM-116) standard test material. The mean flow properties have been compared to published data found in the literature for the other shear testers.",
				"issue": "3",
				"journalAbbreviation": "Proceedings of the Institution of Mechanical Engineers, Part E: Journal of Process Mechanical Engineering",
				"libraryCatalog": "SAGE Journals",
				"pages": "215-230",
				"publicationTitle": "Proceedings of the Institution of Mechanical Engineers, Part E: Journal of Process Mechanical Engineering",
				"url": "https://doi.org/10.1177/0954408914525387",
				"volume": "229",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Shear cell"
					},
					{
						"tag": "BCR limestone powder (CRM-116)"
					},
					{
						"tag": "flow function"
					},
					{
						"tag": "characterizing powder flowability"
					},
					{
						"tag": "reproducibility"
					},
					{
						"tag": "Brookfield powder flow tester"
					},
					{
						"tag": "Jenike shear cell"
					},
					{
						"tag": "Schulze ring shear tester"
=======
}





/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0040573620918177",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Who Is Saved?",
				"creators": [
					{
						"lastName": "Duff",
						"firstName": "Nancy J.",
						"creatorType": "author"
					}
				],
				"date": "Juli 1, 2020",
				"DOI": "10.1177/0040573620918177",
				"ISSN": "0040-5736",
				"issue": "2",
				"journalAbbreviation": "Theology Today",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "210-217",
				"publicationTitle": "Theology Today",
				"url": "https://doi.org/10.1177/0040573620918177",
				"volume": "77",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0040573619865711",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Reformed Sacramentality",
				"creators": [
					{
						"lastName": "Galbreath",
						"firstName": "Paul",
						"creatorType": "author"
					}
				],
				"date": "Oktober 1, 2019",
				"DOI": "10.1177/0040573619865711",
				"ISSN": "0040-5736",
				"issue": "3",
				"journalAbbreviation": "Theology Today",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "261-265",
				"publicationTitle": "Theology Today",
				"url": "https://doi.org/10.1177/0040573619865711",
				"volume": "76",
				"attachments": [],
				"tags": [
					{
						"tag": "Book Review"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0040573619826522",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Myth of Rebellious Angels: Studies in Second Temple Judaism and the New Testament Texts by Loren T. Stuckenbruck",
				"creators": [
					{
						"lastName": "Wold",
						"firstName": "Benjamin",
						"creatorType": "author"
					}
				],
				"date": "April 1, 2019",
				"DOI": "10.1177/0040573619826522",
				"ISSN": "0040-5736",
				"issue": "1",
				"journalAbbreviation": "Theology Today",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "83-84",
				"publicationTitle": "Theology Today",
				"shortTitle": "The Myth of Rebellious Angels",
				"url": "https://doi.org/10.1177/0040573619826522",
				"volume": "76",
				"attachments": [],
				"tags": [
					{
						"tag": "Book Review"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0969733020929062",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nurses’ refusals of patient involvement in their own palliative care",
				"creators": [
					{
						"lastName": "Glasdam",
						"firstName": "Stinne",
						"creatorType": "author"
					},
					{
						"lastName": "Jacobsen",
						"firstName": "Charlotte Bredahl",
						"creatorType": "author"
					},
					{
						"lastName": "Boelsbjerg",
						"firstName": "Hanne Bess",
						"creatorType": "author"
					}
				],
				"date": "Dezember 1, 2020",
				"DOI": "10.1177/0969733020929062",
				"ISSN": "0969-7330",
				"abstractNote": "Background:Ideas of patient involvement are related to notions of self-determination and autonomy, which are not always in alignment with complex interactions and communication in clinical practice.Aim:To illuminate and discuss patient involvement in routine clinical care situations in nursing practice from an ethical perspective.Method:A case study based on an anthropological field study among patients with advanced cancer in Denmark.Ethical considerations:Followed the principles of the Helsinki Declaration.Findings:Two cases illustrated situations where nurses refused patient involvement in their own case.Discussion:Focus on two ethical issues, namely ‘including patients’ experiences in palliative nursing care’ and ‘relational distribution of power and knowledge’, inspired primarily by Hannah Arendt’s concept of thoughtlessness and a Foucauldian perspective on the medical clinic and power. The article discusses how patients’ palliative care needs and preferences, knowledge and statements become part of the less significant background of nursing practice, when nurses have a predefined agenda for acting with and involvement of patients. Both structurally conditioned ‘thoughtlessness’ of the nurses and distribution of power and knowledge between patients and nurses condition nurses to set the agenda and assess when and at what level it is relevant to take up patients’ invitations to involve them in their own case.Conclusion:The medical and institutional logic of the healthcare service sets the framework for the exchange between professional and patient, which has an embedded risk that ‘thoughtlessness’ appears among nurses. The consequences of neglecting the spontaneous nature of human action and refusing the invitations of the patients to be involved in their life situation call for ethical and practical reflection among nurses. The conditions for interaction with humans as unpredictable and variable challenge nurses’ ways of being ethically attentive to ensure that patients receive good palliative care, despite the structurally conditioned logic of healthcare.",
				"issue": "8",
				"journalAbbreviation": "Nurs Ethics",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "1618-1630",
				"publicationTitle": "Nursing Ethics",
				"url": "https://doi.org/10.1177/0969733020929062",
				"volume": "27",
				"attachments": [],
				"tags": [
					{
						"tag": " Patient involvement"
					},
					{
						"tag": " nurse refusals"
					},
					{
						"tag": " palliative care"
					},
					{
						"tag": " power"
					},
					{
						"tag": " thoughtlessness"
					}
				],
				"notes": [
					{
						"note": "orcid:0000-0002-0893-3054 | author=Glasdam, Stinne"
					},
					{
						"note": "LF:"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0037768620920172",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Bridging sociology of religion to transition to adulthood: The emerging role of religion in young adults’ lives",
				"creators": [
					{
						"lastName": "Jung",
						"firstName": "Gowoon",
						"creatorType": "author"
					},
					{
						"lastName": "Park",
						"firstName": "Hyunjoon",
						"creatorType": "author"
					}
				],
				"date": "September 1, 2020",
				"DOI": "10.1177/0037768620920172",
				"ISSN": "0037-7686",
				"abstractNote": "The sociology of religion has not systematically explored the emerging roles of religion in the whole process of the transition to adulthood, especially in the changing contexts of delayed and complicated transitions to adulthood. Seeking to bridge the two different fields of sociology, we identify four directions of research: (1) a multidimensional approach that identifies the different dimensions of religion with varying degrees of relationship to young adults’ lives; (2) a close attention to racial/ethnic variation in the roles of religion for the transition to adulthood; (3) an open inquiry into the changing importance of religion for young adults in a rapidly shifting neoliberal global economy; and (4) the detrimental effects of religion in the transition to adulthood. We call for more research on the increasingly complex relationship between religion and the transition to adulthood.",
				"issue": "3",
				"journalAbbreviation": "Social Compass",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "428-443",
				"publicationTitle": "Social Compass",
				"shortTitle": "Bridging sociology of religion to transition to adulthood",
				"url": "https://doi.org/10.1177/0037768620920172",
				"volume": "67",
				"attachments": [],
				"tags": [
					{
						"tag": " minority"
					},
					{
						"tag": " minorité"
					},
					{
						"tag": " neoliberalism"
					},
					{
						"tag": " néolibéralisme"
					},
					{
						"tag": " race and ethnicity"
					},
					{
						"tag": " race et ethnicité"
					},
					{
						"tag": " religion"
					},
					{
						"tag": " religion"
					},
					{
						"tag": " transition to adulthood"
					},
					{
						"tag": " transition vers l’âge adulte"
					},
					{
						"tag": " young adults"
					},
					{
						"tag": "jeunes adultes"
					}
				],
				"notes": [
					{
						"note": "abs:La littérature n’a accordé que peu d’attention à la religion en tant que force sociale affectant les transitions des rôles sociaux des jeunes et leurs perceptions subjectives de l’âge adulte. La sociologie de la religion n’a pas systématiquement exploré les rôles émergents de la religion dans des contextes changeants de transitions retardées et compliquées vers l’âge adulte. En cherchant à rapprocher les deux domaines différents de la sociologie, nous identifions quatre directions de recherches : (1) une approche multidimensionnelle de la religion qui identifie différentes dimensions de la religion avec des degrés variables de relation avec la vie des jeunes adultes ; (2) une attention particulière aux variations raciales/ethniques dans les rôles de la religion dans la transition vers l’âge adulte ; (3) une enquête ouverte sur l’évolution de l’importance de la religion pour les jeunes adultes dans une économie mondiale néolibérale en mutation rapide ; et (4) les effets néfastes de la religion dans la transition vers l’âge adulte. Nous appelons à davantage de recherches sur la relation de plus en plus complexe entre la religion et la transition vers l’âge adulte."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0146107920958985",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "“The Land Is Mine” (Leviticus 25:23): Reimagining the Jubilee in the Context of the Palestinian-Israeli Conflict",
				"creators": [
					{
						"lastName": "Joseph",
						"firstName": "Simon J.",
						"creatorType": "author"
					}
				],
				"date": "November 1, 2020",
				"DOI": "10.1177/0146107920958985",
				"ISSN": "0146-1079",
				"abstractNote": "The Jubilee tradition commemorates the release of slaves, the remission of debt, and the repatriation of property, a “day” of physical and spiritual restoration. The Jubilee tradition—originating in a constitutional vision of ancient Israel periodically restoring its ancestral sovereignty as custodians of the land—became a master symbol of biblical theology, a powerful ideological resource as well as a promise of a divinely realized future during the Second Temple period, when the Qumran community envisioned an eschatological Jubilee and the early Jesus tradition remembered Jesus’ nonviolence in Jubilee-terms. Jubilee themes can also be identified in ideals inscribed in the founding of America, the Abolition movement, the Women’s Liberation Movement, the Civil Rights movement, and Liberation Theology. This study seeks to extend the exploration of Jubilee themes by adopting a comparative methodological approach, re-examining Jubilee themes in the context of the contemporary Palestinian-Israeli conflict, where the dream of Peace in the Middle East continues to play out in predominantly politicized contexts.",
				"issue": "4",
				"journalAbbreviation": "Biblical Theology Bulletin",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "180-190",
				"publicationTitle": "Biblical Theology Bulletin",
				"shortTitle": "“The Land Is Mine” (Leviticus 25",
				"url": "https://doi.org/10.1177/0146107920958985",
				"volume": "50",
				"attachments": [],
				"tags": [
					{
						"tag": " Jubilee Year"
					},
					{
						"tag": " Liberation"
					},
					{
						"tag": " Palestinian/Israeli Conflict"
					},
					{
						"tag": " Peace & Nonviolence"
>>>>>>> master
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
<<<<<<< HEAD
		"url": "http://journals.sagepub.com/action/doSearch?AllField=test",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journals.sagepub.com/doi/full/10.1177/1541204015581389",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Moffitt’s Developmental Taxonomy and Gang Membership: An Alternative Test of the Snares Hypothesis",
				"creators": [
					{
						"firstName": "Melissa A.",
						"lastName": "Petkovsek",
						"creatorType": "author"
					},
					{
						"firstName": "Brian B.",
						"lastName": "Boutwell",
						"creatorType": "author"
					},
					{
						"firstName": "J. C.",
						"lastName": "Barnes",
						"creatorType": "author"
					},
					{
						"firstName": "Kevin M.",
						"lastName": "Beaver",
						"creatorType": "author"
					}
				],
				"date": "October 1, 2016",
				"DOI": "10.1177/1541204015581389",
				"ISSN": "1541-2040",
				"abstractNote": "Moffitt’s taxonomy remains an influential theoretical framework within criminology. Despite much empirical scrutiny, comparatively less time has been spent testing the snares component of Moffitt’s work. Specifically, are there factors that might engender continued criminal involvement for individuals otherwise likely to desist? The current study tested whether gang membership increased the odds of contact with the justice system for each of the offender groups specified in Moffitt’s original developmental taxonomy. Our findings provided little evidence that gang membership increased the odds of either adolescence-limited or life-course persistent offenders being processed through the criminal justice system. Moving forward, scholars may wish to shift attention to alternative variables—beyond gang membership—when testing the snares hypothesis.",
				"issue": "4",
				"journalAbbreviation": "Youth Violence and Juvenile Justice",
				"libraryCatalog": "SAGE Journals",
				"pages": "335-349",
				"publicationTitle": "Youth Violence and Juvenile Justice",
				"shortTitle": "Moffitt’s Developmental Taxonomy and Gang Membership",
				"url": "https://doi.org/10.1177/1541204015581389",
				"volume": "14",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Moffitt’s developmental taxonomy"
					},
					{
						"tag": "gang membership"
					},
					{
						"tag": "snares"
					},
					{
						"tag": "delinquency"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/2056997119868248",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Discernment, technology, and digital citizenship in a Christian school system",
				"creators": [
					{
						"lastName": "Smith",
						"firstName": "David I",
						"creatorType": "author"
					},
					{
						"lastName": "Sevensma",
						"firstName": "Kara",
						"creatorType": "author"
					}
				],
				"date": "Juli 1, 2020",
				"DOI": "10.1177/2056997119868248",
				"ISSN": "2056-9971",
				"abstractNote": "Using a qualitative analysis of school artifacts, this article analyzes the documentary record of one Christian school system’s experience with technological change. It focuses on documentary evidence for how the concept of Christian discernment was deployed to situate new technologies within a Christian discourse. The idea of discernment shifted in emphasis as new technologies were implemented. The theologically rooted concept of discernment both shaped and was shaped by the ongoing effort to manage technological change. Examining this evolution offers an empirical contribution to discussions of how Christian schools can sustain an integrity of fit between faith and practice.",
				"issue": "2",
				"journalAbbreviation": "International Journal of Christianity & Education",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "135-152",
				"publicationTitle": "International Journal of Christianity & Education",
				"url": "https://doi.org/10.1177/2056997119868248",
				"volume": "24",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " digital citizenship"
					},
					{
						"tag": " digital technology"
					},
					{
						"tag": " discernment"
					},
					{
						"tag": " school leadership"
					},
					{
						"tag": " theology"
					},
					{
						"tag": "Keywords Christian schools"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0040571X20944577",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Praying to win: reflections on the involvement of God in the outcomes of sport",
				"creators": [
					{
						"lastName": "Smith",
						"firstName": "Jason M.",
						"creatorType": "author"
=======
		"url": "https://journals.sagepub.com/doi/full/10.1177/0040573620947051",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "My Friend Johann Baptist Metz",
				"creators": [
					{
						"lastName": "Moltmann",
						"firstName": "Jürgen",
						"creatorType": "author"
					},
					{
						"lastName": "Lösel ",
						"firstName": "Steffen",
						"creatorType": "translator"
					}
				],
				"date": "Oktober 1, 2020",
				"DOI": "10.1177/0040573620947051",
				"ISSN": "0040-5736",
				"abstractNote": "Johann Baptist Metz died on December 2, 2019. He and Jürgen Moltmann shared a theological and personal friendship marked by affection and respect. It was an honest friendship and it lasted for over fifty years. It started when two texts met: Metz’s essay “God before Us” and Moltmann’s essay “The Category of Novum in Christian Theology.” Both were published in the volume To Honor Ernst Bloch (1965). This article is a personal reminiscence.",
				"issue": "3",
				"journalAbbreviation": "Theology Today",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "310-312",
				"publicationTitle": "Theology Today",
				"url": "https://doi.org/10.1177/0040573620947051",
				"volume": "77",
				"attachments": [],
				"tags": [
					{
						"tag": " Catholic"
					},
					{
						"tag": " Johann Baptist Metz"
					},
					{
						"tag": " eulogy"
					},
					{
						"tag": " memory"
					},
					{
						"tag": " political theology"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0084672420926259",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Which psychology(ies) serves us best? Research perspectives on the psycho-cultural interface in the psychology of religion(s)",
				"creators": [
					{
						"lastName": "Anczyk",
						"firstName": "Adam",
						"creatorType": "author"
					},
					{
						"lastName": "Grzymała-Moszczyńska",
						"firstName": "Halina",
						"creatorType": "author"
					},
					{
						"lastName": "Krzysztof-Świderska",
						"firstName": "Agnieszka",
						"creatorType": "author"
					},
					{
						"lastName": "Prusak",
						"firstName": "Jacek",
						"creatorType": "author"
					}
				],
				"date": "November 1, 2020",
				"DOI": "10.1177/0084672420926259",
				"ISSN": "0084-6724",
				"abstractNote": "The article concentrates on answering the main question to be addressed, as stated in its title: which psychology(ies) serves us best? In order to achieve this goal, we pursue possible answers in history of psychology of religion and its interdisciplinary relationships with its sister disciplines, anthropology of religion and religious studies, resulting with sketching a typology of the main attitudes towards conceptualising psycho-cultural interface, prevalent among psychologists: the Universalist, the Absolutist and the Relativist stances. Next chosen examples from the field of applied psychology are presented, as the role of the cultural factor within the history of Diagnostic and Statistical Manual of Mental Disorders’ (DSM) development is discussed alongside presenting research on the phenomenon of ‘hearing voices’, in order to show the marked way for the future – the importance of including the cultural factor in psychological research on religion.",
				"issue": "3",
				"journalAbbreviation": "Archive for the Psychology of Religion",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "295-316",
				"publicationTitle": "Archive for the Psychology of Religion",
				"shortTitle": "Which psychology(ies) serves us best?",
				"url": "https://doi.org/10.1177/0084672420926259",
				"volume": "42",
				"attachments": [],
				"tags": [
					{
						"tag": " Cross-cultural research"
					},
					{
						"tag": " cultural psychology"
					},
					{
						"tag": " history"
					},
					{
						"tag": " methodology"
					},
					{
						"tag": " multicultural issues"
					},
					{
						"tag": " religion"
>>>>>>> master
					}
				],
				"date": "September 1, 2020",
				"DOI": "10.1177/0040571X20944577",
				"ISSN": "0040-571X",
				"abstractNote": "This article applies to sport the question: to what extent is God involved in the outcomes of worldly affairs? It examines Lincoln Harvey’s assertion that sport is one unique area of creation in which God has left the outcomes entirely up to us, as a ‘liturgical celebration of our contingency’. Not entirely satisfied with this answer, I take up concepts from Kathryn Tanner’s work to try to arrive at a solution wherein God’s providential care over all worldly affairs is maintained but with sufficient care so as not to imagine God choosing one team over another during every sporting event.",
				"issue": "5",
				"journalAbbreviation": "Theology",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "329-336",
				"publicationTitle": "Theology",
				"shortTitle": "Praying to win",
				"url": "https://doi.org/10.1177/0040571X20944577",
				"volume": "123",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " Kathryn Tanner"
					},
					{
<<<<<<< HEAD
						"tag": " Lincoln Harvey"
					},
					{
						"tag": " providence"
					},
					{
						"tag": " sport"
					},
					{
						"tag": "Keywords contingency"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/2056997120919765",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Covenant and pedagogy",
				"creators": [
					{
						"lastName": "Faber",
						"firstName": "Ben",
						"creatorType": "author"
=======
						"note": "orcid:0000-0001-6906-3104 | author=Anczyk, Adam"
					},
					{
						"note": "orcid:0000-0003-2751-3204 | author=Grzymała-Moszczyńska, Halina"
>>>>>>> master
					}
				],
				"date": "November 1, 2020",
				"DOI": "10.1177/2056997120919765",
				"ISSN": "2056-9971",
				"abstractNote": "This article argues that “covenant” ought to serve universally as a framework for education, beyond the exclusive sense of covenant in use in Reformed Christian education. The article begins with covenant as creation’s answerable relationship with the Creator, then offers a brief account of language as a form of covenantal exchange, and concludes with pedagogy as a function of the covenantal structures of being and of speaking.",
				"issue": "3",
				"journalAbbreviation": "International Journal of Christianity & Education",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "254-268",
				"publicationTitle": "International Journal of Christianity & Education",
				"url": "https://doi.org/10.1177/2056997120919765",
				"volume": "24",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": " Speech Act Theory"
					},
					{
						"tag": " answerability"
					},
					{
						"tag": " covenant theology"
					},
					{
						"tag": " philosophy of education"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/0014524620944817",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Commentary on the Letter of Polycarp to the Philippians",
				"creators": [
					{
						"lastName": "Foster",
						"firstName": "Paul",
						"creatorType": "author"
					}
				],
				"date": "Oktober 1, 2020",
				"DOI": "10.1177/0014524620944817",
				"ISSN": "0014-5246",
				"issue": "1",
				"journalAbbreviation": "The Expository Times",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "40",
				"publicationTitle": "The Expository Times",
				"url": "https://doi.org/10.1177/0014524620944817",
				"volume": "132",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
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
		"url": "https://journals.sagepub.com/doi/full/10.1177/0014524620944817",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Commentary on the Letter of Polycarp to the Philippians",
				"creators": [
					{
						"lastName": "Foster",
						"firstName": "Paul",
						"creatorType": "author"
					}
				],
				"date": "Oktober 1, 2020",
				"DOI": "10.1177/0014524620944817",
				"ISSN": "0014-5246",
				"issue": "1",
				"journalAbbreviation": "The Expository Times",
				"language": "en",
				"libraryCatalog": "SAGE Journals",
				"pages": "40",
				"publicationTitle": "The Expository Times",
				"url": "https://doi.org/10.1177/0014524620944817",
				"volume": "132",
				"attachments": [
					{
						"title": "SAGE PDF Full Text",
						"mimeType": "application/pdf"
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
	}
]
/** END TEST CASES **/
