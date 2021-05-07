(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{397:function(t,e,s){"use strict";s.r(e);var a=s(21),n=Object(a.a)({},(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"transaction-helper"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#transaction-helper"}},[t._v("#")]),t._v(" Transaction Helper")]),t._v(" "),s("h2",{attrs:{id:"introduction"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#introduction"}},[t._v("#")]),t._v(" Introduction")]),t._v(" "),s("p",[t._v("When a frontend calls an HTTP endpoint the normal expectation is that the HTTP status code would relate to the "),s("em",[t._v("functional")]),t._v(" outcome which was requested. This expectation, however, can be lost when you are running a micro-services backend because the HTTP event triggers a function which runs a sequence of functions to achieve it's aims.")]),t._v(" "),s("p",[t._v('You "could" keep the initial function active during the duration of functional fan-out but this would be resource inefficient so instead this helper function provides a means to allow the serverless functions to work entirely asynchronously but still provide the frontend with a "functional response" that is consistent with normal REST-based API\'s.')]),t._v(" "),s("h2",{attrs:{id:"usage"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#usage"}},[t._v("#")]),t._v(" Usage")]),t._v(" "),s("p",[t._v("The frontend should wrap their network calls with "),s("code",[t._v("transaction")]),t._v(" like so:")]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" transaction "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aws-orchestrate'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" apiResult "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("transaction")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("axios"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("endpoint"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br")])]),s("blockquote",[s("p",[t._v("Note: in the above example we are using the popular "),s("code",[t._v("axios")]),t._v(" library for calling the endpoint but you can use whichever library you prefer.")])]),t._v(" "),s("p",[t._v("Let's imagine that this endpoint then calls a "),s("em",[t._v("sequence")]),t._v(" of four functions where the fourth function provides the functional payload that the client expects.")]),t._v(" "),s("process-flow",[t._v('graph LR;subgraph client; START("Client HTTP call"); end; subgraph backend; START--\x3eA["Conductor"];A--\x3eB["Verify Something"];B--\x3eC["Do Something"];C--\x3eD("DONE"); end')]),t._v(" "),s("p",[t._v("Let's assume that the response structure for "),s("strong",[t._v("fn4")]),t._v(" is:")]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IResponse")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  message"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  people"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("\n    name"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("string")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    age"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("number")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br")])]),s("p",[t._v("When the transaction helper receives a 200/2xx success status from "),s("strong",[t._v("fn4")]),t._v(" it then returns the data described in "),s("code",[t._v("IResponse")]),t._v(" interface. If, however, an error is incurred then the full Error object -- including "),s("em",[t._v("message")]),t._v(", "),s("em",[t._v("code")]),t._v(", "),s("em",[t._v("name")]),t._v(", and "),s("em",[t._v("stack")]),t._v(" will be provided. If, you really "),s("em",[t._v("want")]),t._v(" to receive the status code for a success message you can achieve this by passing "),s("code",[t._v("{ returnStatus: true }")]),t._v(" into the options hash for "),s("code",[t._v("transaction")]),t._v(":")]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" transaction "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aws-orchestrate'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" apiResult "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("transaction")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("axios"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("endpoint"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" returnStatus"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/* `code` and `data` properties available; `data` is of type `IResponse` **/")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// handle error")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br")])]),s("h2",{attrs:{id:"backend-configuration"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#backend-configuration"}},[t._v("#")]),t._v(" Backend Configuration")]),t._v(" "),s("h3",{attrs:{id:"sequencetracker"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#sequencetracker"}},[t._v("#")]),t._v(" SequenceTracker")]),t._v(" "),s("p",[t._v("To enable the frontend in getting more traditional "),s("em",[t._v("functional")]),t._v(" status the "),s("code",[t._v("SequenceTracker")]),t._v(" function "),s("strong",[t._v("must")]),t._v(" be deployed within your Serverless project. Doing this is straight forward and involves importing the function from "),s("code",[t._v("aws-orchestrate")]),t._v(" and then just exporting it as one of your own handler functions.")]),t._v(" "),s("p",[t._v("If you are using the "),s("code",[t._v("typescript-microservice")]),t._v(" yeoman template then you can not only get the function definition but the inline configuration for this function by adding the following file to your project:")]),t._v(" "),s("p",[s("strong",[s("code",[t._v("src/handlers/SequenceTracker.ts")])])]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" SequenceTracker"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" SequenceTrackerConfig "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aws-orchestrate'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" handler "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" SequenceTracker"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" config "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" SequenceTrackerConfig"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br")])]),s("h3",{attrs:{id:"archivetracker"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#archivetracker"}},[t._v("#")]),t._v(" ArchiveTracker")]),t._v(" "),s("p",[t._v("The "),s("code",[t._v("ArchiveTracker")]),t._v(" -- like the "),s("code",[t._v("SequenceTracker")]),t._v(" -- is a Serverless function provided as an export in this library. Unlike the SequenceTracker, ArchiveTracker is not "),s("em",[t._v("strictly")]),t._v(" required but it is generally a good idea to include in your project as well. It's function is to clear out old/stale status messages from the Firebase database.")]),t._v(" "),s("p",[t._v("As these messages are really only intended to have short term value (aka, as the "),s("code",[t._v("LambdaSequence")]),t._v(" is executing) they can be comfortably removed after a day in the database. If you take the configuration provided in the "),s("code",[t._v("ArchiveTrackerConfig")]),t._v(" export, it will run the "),s("code",[t._v("ArchiveTracker")]),t._v(" every day at 1am. You, of course, can decide to change the frequency or timing to meet the needs of your project.")]),t._v(" "),s("p",[t._v("Again assuming you are using the "),s("code",[t._v("typescript-microservices")]),t._v(" yeoman template as a foundation for your Serverless project the file in your project would look something like:")]),t._v(" "),s("p",[s("strong",[s("code",[t._v("src/handlers/ArchiveTracker.ts")])])]),t._v(" "),s("div",{staticClass:"language-typescript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" ArchiveTracker"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" ArchiveTrackerConfig "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aws-orchestrate'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" handler "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ArchiveTracker"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" config "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ArchiveTrackerConfig"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br")])])],1)}),[],!1,null,null,null);e.default=n.exports}}]);