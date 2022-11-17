{
	"translatorID": "bb53844a-2adf-4b6a-989b-d0266674f3af",
	"label": "ubtue_SAGE Journals",
	"creator": "Sebastian Karcher",
	"target": "^https?://journals\\.sagepub\\.com(/toc)?(/doi/((abs|full|pdf)/)?10\\.|/action/doSearch\\?|/toc/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2022-11-03 17:23:49"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2016 Philipp Zumstein
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, url) {
	if (url.includes('/abs/10.') || url.includes('/full/10.') || url.includes('/pdf/10.') || url.includes('/doi/10.')) {
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
	let rows = ZU.xpath(doc, '//span[contains(@class, "art_title")]/a[contains(@href, "/doi/full/10.") or contains(@href, "/doi/abs/10.") or contains(@href, "/doi/pdf/10.")][1] | //a[contains(concat( " ", @class, " " ), concat( " ", "ref", " " )) and contains(concat( " ", @class, " " ), concat( " ", "nowrap", " " ))] | //*[contains(concat( " ", @class, " " ), concat( " ", "hlFld-Title", " " ))]');
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


function scrape(doc, url) {
	var risURL = "//journals.sagepub.com/action/downloadCitation";
	var doi = ZU.xpathText(doc, '//meta[@name="dc.Identifier" and @scheme="doi"]/@content');
	if (!doi) {
		doi = url.match(/10\.[^?#]+/)[0];
	}
	var post = "doi=" + encodeURIComponent(doi) + "&include=abs&format=bibtex&direct=false&submit=Download+Citation";
	var pdfurl = "//" + doc.location.host + "/doi/pdf/" + doi;
	var articleType = ZU.xpath(doc, '//span[@class="ArticleType"]/span');
	//Z.debug(pdfurl);
	//Z.debug(post);
	ZU.doPost(risURL, post, function (text) {
		//The publication date is saved in DA and the date first
		//appeared online is in Y1. Thus, we want to prefer DA over T1
		//and will therefore simply delete the later in cases both
		//dates are present.
		//Z.debug(text);
		if (text.includes("DA  - ")) {
			text = text.replace(/Y1\s{2}- .*\r?\n/, '');
		}

		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
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
			//if author name include "(Translator)" change creatorType and delete "(Translator" from lastName e.g. https://journals.sagepub.com/doi/full/10.1177/0040573620947051
			for (let i in item.creators) {
				let translator = item.creators[i].lastName;
				if (item.creators[i].lastName.match(/\(?Translator\)?/)) {
					item.creators[i].creatorType = "translator";
					item.creators[i].lastName = item.creators[i].lastName.replace('(Translator)', '');
				}
			}
			//scrape ORCID from website e.g. https://journals.sagepub.com/doi/full/10.1177/0084672419883339
			let authorSectionEntries = doc.querySelectorAll('.author-section-div');
			for (let authorSectionEntry of authorSectionEntries) {
				let entryHTML = authorSectionEntry.innerHTML;
				let regexOrcid = /\d+-\d+-\d+-\d+x?/i;
				let regexName = /author=.*"/;
				if(entryHTML.match(regexOrcid)) {
					item.notes.push({note: "orcid:" + entryHTML.match(regexOrcid)[0] + ' | ' + entryHTML.match(regexName)[0].replace('\"', '').replace('author=', '')});
				}
			}
			
			//scrape ORCID from website e.g. https://journals.sagepub.com/doi/full/10.1177/0084672419883339
			let newAuthorSectionEntries = ZU.xpath(doc, '//span[@property="author"]');
			for (let authorSectionEntry of newAuthorSectionEntries) {
				if (ZU.xpathText(authorSectionEntry, './a[contains(@href, "orcid")]')) {
					let orcid = ZU.xpathText(authorSectionEntry, './a[contains(@href, "orcid")]').replace(/https?:\/\/orcid.org\//, '');
					let authorName = ZU.xpathText(authorSectionEntry, './/span[@property="givenName"]') + ' ' + ZU.xpathText(authorSectionEntry, './/span[@property="familyName"]');
					item.notes.push({"note": "orcid:" + orcid + ' | ' + authorName});
				}	
			}
			//scrape ORCID at the bottom of text and split firstName and lastName for deduplicate notes. E.g. most of cases by reviews https://journals.sagepub.com/doi/10.1177/15423050211028189
			let ReviewAuthorSectionEntries = doc.querySelectorAll('.NLM_fn p');
			for (let ReviewAuthorSectionEntry of ReviewAuthorSectionEntries) {
				let entryInnerText = ReviewAuthorSectionEntry.innerText;
				let regexOrcid = /\d+-\d+-\d+-\d+x?/i;
				if(entryInnerText.match(regexOrcid) && entryInnerText.split('\n')[1] != undefined) {
					let authorEntry = entryInnerText.split('\n')[1].replace(/https:\/\/.*/, '');
					let fullName = entryInnerText.match(authorEntry)[0].replace('\"', '').trim();Z.debug(fullName)
					let	firstName = fullName.split(' ').slice(0, -1).join(' ');
					let	lastName = fullName.split(' ').slice(-1).join(' ');
					item.notes.push({note: "orcid:" + entryInnerText.match(regexOrcid)[0] + ' | ' + lastName + ', ' + firstName});
				}				
			}
			 
			// Workaround to address address weird incorrect multiple extraction by both querySelectorAll and xpath
			// So, let's deduplicate...
			item.notes = Array.from(new Set(item.notes.map(JSON.stringify))).map(JSON.parse);
			// ubtue: extract translated and other abstracts from the different xpath
			var ubtueabstract = ZU.xpathText(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "abstractInFull", " " ))]');
			var otherabstract = ZU.xpathText(doc, '//article//div[contains(@class, "tabs-translated-abstract")]/p');
			var abstract = ZU.xpathText(doc, '//article//div[contains(@class, "abstractSection")]/p');
			if (abstract) {
				item.abstractNote = abstract;
			}
			if (otherabstract) {
				item.notes.push({note: "abs:" + ZU.unescapeHTML(otherabstract.replace(/^Résumé/, ''))});
			} 
			else if (ubtueabstract != null) {
				item.abstractNote = ZU.unescapeHTML(ubtueabstract);
			}			

			var tagentry = ZU.xpathText(doc, '//kwd-group[1] | //*[contains(concat( " ", @class, " " ), concat( " ", "hlFld-KeywordText", " " ))]');
			if (tagentry) {
				item.tags = tagentry.replace(/.*Keywords/, ',').replace(/Mots-clés/, ',').split(",");
			}
			// ubtue: add tags "Book Review" if ""Book Review"
			if (articleType) {
				for (let r of articleType) {
					var reviewDOIlink = r.innerHTML;
					if (reviewDOIlink.match(/(product|book)\s+reviews?/i)) {
						item.tags.push('RezensionstagPica');
					} else if (reviewDOIlink.match(/article\s+commentary|review\s+article/i)) { //"Review article", "Article commentary" as Keywords
						item.tags.push(reviewDOIlink)
					}
				}
			}
			if (ZU.xpathText(doc, '//span[contains(., "ISSN:")]') && ZU.xpathText(doc, '//span[contains(., "ISSN:")]').match(/\d{4}-?\d{3}[\dxX]/)) item.ISSN = ZU.xpathText(doc, '//span[contains(., "ISSN:")]').match(/\d{4}-?\d{3}[\dxX]/)[0];
			//ubtue: add tag "Book Review" in every issue 5 of specific journals if the dc.Type is "others"
			let reviewType = ZU.xpathText(doc, '//meta[@name="dc.Type"]/@content');
			if (item.ISSN === '0142-064X' || item.ISSN === '0309-0892') {
				if (reviewType && reviewType.match(/other/i) && item.issue === '5') {
					item.tags.push('RezensionstagPica');
					item.notes.push({note: "Booklist:" + item.date.match(/\d{4}$/)});
					if (item.abstractNote && item.abstractNote.match(/,(?!\s\w)/g)) {
						item.abstractNote = '';	
					}
				}
			}	
			// numbering issues with slash, e.g. in case of  double issue "1-2" > "1/2"
			if (item.issue) item.issue = item.issue.replace('-', '/');

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
			// mark articles as "LF" (MARC=856 |z|kostenfrei), that are published as open access
			let accessIcon = doc.querySelector('.accessIcon[alt]');
			if (accessIcon && accessIcon.alt.match(/open\s+access/gi)) item.notes.push({note: 'LF:'});
			else if (ZU.xpathText(doc, '//i[@class="icon-open_access"]/@data-original-title') == 'Open access') item.notes.push({note: 'LF:'});
			let newNotes = [];
			for (let note of item.notes) {
				if (note['note'].match(/^(?:<p>)?doi:/) == null) newNotes.push(note)
				}
			item.notes = newNotes;
			item.language = ZU.xpathText(doc, '//meta[@name="dc.Language"]/@content');
			item.attachments = [];
			item.complete();
		});
		translator.translate();
	});
}




/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/10.1177/00084298211036567",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "ACÉBAC: Les voix et les voies de l’Écriture",
				"creators": [
					{
						"firstName": "Rodolfo Felices",
						"lastName": "Luna",
						"creatorType": "author"
					}
				],
				"date": "2021",
				"DOI": "10.1177/00084298211036567",
				"ISSN": "0008-4298",
				"abstractNote": "L’Association catholique d’études bibliques au Canada a été fondée en 1943 afin de promouvoir les études bibliques en français parmi le clergé catholique en charge de la formation académique des séminaristes. Au cours de ses 77 années d’existence, cette société savante a navigué à travers deux tournants herméneutiques majeurs : le déplacement d’attention de l’exégèse historico-critique vers les méthodes littéraires centrées sur le texte final, puis le déplacement subséquent vers les approches attentives aux lectrices et lecteurs. À partir de la Révolution tranquille au Québec, la composition de l’assemblée des membres s’est progressivement diversifiée, pour y inclure des laïcs, des femmes, des étranger.e.s à la foi catholique et des savant.e.s du monde séculier, sans affiliation religieuse professée ou connue. Le travail de l’exégèse est appelé à rencontrer le défi de l’interdisciplinarité, compte tenu de l’intérêt grandissant des sciences humaines et sociales pour le texte biblique.",
				"issue": "3",
				"itemID": "doi:10.1177/00084298211036567",
				"language": "en",
				"libraryCatalog": "ubtue_SAGE Journals",
				"pages": "336-343",
				"publicationTitle": "Studies in Religion/Sciences Religieuses",
				"shortTitle": "ACÉBAC",
				"url": "https://doi.org/10.1177/00084298211036567",
				"volume": "50",
				"attachments": [],
				"tags": [
					{
						"tag": "Canada"
					},
					{
						"tag": "Canada"
					},
					{
						"tag": "French language"
					},
					{
						"tag": "biblical studies"
					},
					{
						"tag": "exegesis"
					},
					{
						"tag": "exégèse"
					},
					{
						"tag": "langue française"
					},
					{
						"tag": "learned societies"
					},
					{
						"tag": "sociétés savantes"
					},
					{
						"tag": "études bibliques"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/toc/pcca/current",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journals.sagepub.com/doi/full/10.1177/09518207221115929",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The phallus in our stars: Sexual violence in the Animal Apocalypse",
				"creators": [
					{
						"firstName": "Megan R.",
						"lastName": "Remington",
						"creatorType": "author"
					},
					{
						"firstName": "Julianna Kaye",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"date": "2022",
				"DOI": "10.1177/09518207221115929",
				"ISSN": "0951-8207",
				"abstractNote": "The Animal Apocalypse (1 En. 85–90) provides some of the most vivid imagery in Second Temple literature. In reference to the descent of the Watchers allegorized as stars, the narrative invokes the simile “they let out their phalluses like stallions” three times. Beyond the simile’s allusion to the oracle in Ezek 23:20, the stallion phallus remains largely unexplored. Our investigation demonstrates the associations of stallions with “aggressive virility” and foreignness based on the Hebrew Bible and contemporary Hellenistic and early Jewish literature. Moreover, we show the Animal Apocalypse’s innovative emphasis on the violent nature of the sexual acts, a feature absent in Gen 6 and the Book of Watchers, and argue for the episode’s contextualization with other early Jewish texts in which sexual violence is present. By spotlighting the stallion-phallused stars with their foreign genitalia, the Animal Apocalypse highlights anxieties surrounding communal boundary crossing and its violent repercussions.",
				"issue": "1",
				"itemID": "doi:10.1177/09518207221115929",
				"language": "en",
				"libraryCatalog": "ubtue_SAGE Journals",
				"pages": "57-74",
				"publicationTitle": "Journal for the Study of the Pseudepigrapha",
				"shortTitle": "The phallus in our stars",
				"url": "https://doi.org/10.1177/09518207221115929",
				"volume": "32",
				"attachments": [],
				"tags": [
					{
						"tag": "1 Enoch"
					},
					{
						"tag": "animal symbolism"
					},
					{
						"tag": "early Judaism"
					},
					{
						"tag": "reception history"
					},
					{
						"tag": "sexual violence"
					}
				],
				"notes": [
					{
						"note": "orcid:0000-0001-7826-6659 | Megan R Remington"
					},
					{
						"note": "orcid:0000-0002-8956-2709 | Julianna Kaye Smith"
					},
					{
						"note": "LF:"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
