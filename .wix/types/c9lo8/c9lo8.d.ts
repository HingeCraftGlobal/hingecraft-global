/// <reference path="../masterPage/masterPage.d.ts" />
type PageElementsMap = MasterPageElementsMap & {
	"#page1": $w.Page;
	"#section1": $w.Section;
	"#legalContent": $w.HtmlComponent;
}