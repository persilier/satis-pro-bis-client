// export const exampleOne = {
//     'layout': 'layout-1',
//     'panel-1': {
//         title: 'Panel 1',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     },
//     'panel-2': {
//         title: 'Panel 2',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     },
//     'action': {
//         title: 'Envoyer',
//         endpoint: '/login'
//     }
// };
//
// export const exampleTwo = {
//     'layout': 'layout-2',
//     'panel-1': {
//         title: 'Panel 1',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     },
//     'action': {
//         title: 'Envoyer',
//         endpoint: '/login'
//     }
// };
//
// export const exampleThree = {
//     layout: 'layout-3',
//     content: [
//         {
//             ...
//         },
//         {
//             ...
//         },
//     ],
//     'action': {
//         title: 'Envoyer',
//         endpoint: '/login'
//     }
// };
//
// export const exampleFour = {
//     'layout': 'layout-4',
//     'panel-1': {
//         title: 'Panel 1',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     },
//     'panel-2': {
//         title: 'Panel 2',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     },
//     'panel-3': {
//         title: 'Panel 3',
//         content: [
//             {
//                 ...
//             },
//             {
//                 ...
//             },
//         ]
//     }
//     ,
//     'action': {
//         title: 'Envoyer',
//         endpoint: '/login'
//     }
// };


export const layoutOne = {
    "name":"",
    "description": "Formulaire du layout 1",
    "content": {
        "layout": "layout-1",
        "panel-1": {
            "title":"Panel 1",
            "content": [
                {
                    "id":"name",
                    "placeholder":"Veillez entrez votre nom",
                    "label":"Votre Nom",
                    "inputClass":"col-md-12",
                    "name":"Pere riche",
                    "value":"",
                    "type":"text",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                },
                {
                    "type":"select",
                    "id":"actor",
                    "placeholder":"Veillez choisir l'acteur",
                    "label":"Votre Acteur",
                    "inputClass":"col-md-12",
                    "name":"actor",
                    "model":"actor",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "panel-2": {
            "title":"Panel 2",
            "content": [
                {
                    "type":"textarea",
                    "id":"article",
                    "placeholder":"Veillez entrez votre article",
                    "label":"Votre article",
                    "inputClass":"col-md-12",
                    "name":"article",
                    "value":"",
                    "cols":"30",
                    "rows":"10",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "action": {
            "title":"Envoyer",
            "endpoint":"/actor/create"
        }
    }
};

var layoutTwo = {
    "name":"",
    "description":"Formulaire du layout 2",
    "content": {
        "layout":"layout-1",
        "panel-1": {
            "title":"Formulaire de connexion",
            "content": [
                {
                    "id":"name",
                    "placeholder":"Veillez entrez votre nom",
                    "label":"Votre Nom",
                    "inputClass":"col-md-6",
                    "name":"name",
                    "value":"",
                    "type":"text",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                },
                {
                    "id":"email",
                    "placeholder":"Veillez entrez votre email",
                    "label":"Votre Email",
                    "inputClass":"col-md-6",
                    "name":"email",
                    "value":"",
                    "type":"email",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                },
                {
                    "id":"password",
                    "placeholder":"Veillez entrez votre mot de passe",
                    "label":"Votre Mot de passe",
                    "inputClass":"col-md-6",
                    "name":"password",
                    "value":"",
                    "type":"password",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                },
                {
                    "id":"passwordConfirmation",
                    "placeholder":"Veillez confirmer votre mot de passe",
                    "label":"Confirmation Password",
                    "inputClass":"col-md-6",
                    "name":"passwordConfirmation",
                    "value":"",
                    "type":"password",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "action": {
            "title":"Envoyer",
            "endpoint":"/sing-up"
        }
    }
};

var layoutThree = {
    "name":"",
    "description":"Formulaire du layout 3",
    "content": {
        "layout": "layout-3",
        "content": [
            {
                "id":"name",
                "placeholder": "Veillez entrez votre nom","label":"Votre Nom","inputClass":"col-md-6","name":"name","value":"","type":"text","required":true,"maxLength":"","minLength":"","regExp":""},
            {
                "id":"email","placeholder":"Veillez entrez votre email","label":"Votre Email","inputClass":"col-md-6","name":"email","value":"","type":"email","required":true,"maxLength":"","minLength":"","regExp":""},
            {
                "id":"password","placeholder":"Veillez entrez votre mot de passe","label":"Votre Mot de passe","inputClass":"col-md-6","name":"password","value":"","type":"password","required":true,"maxLength":"","minLength":"","regExp":""},
            {
                "id":"passwordConfirmation","placeholder":"Veillez confirmer votre mot de passe","label":"Confirmation Password","inputClass":"col-md-6","name":"passwordConfirmation","value":"","type":"password","required":true,"maxLength":"","minLength":"","regExp":""}
        ],
        "action":
            {
                "title":"Envoyer",
                "endpoint":"/sing-up"
            }
    }
};

var layoutFour = {
    "name":"",
    "description":"Formulaire du layout 4",
    "content": {
        "layout":"layout-1",
        "panel-1": {
            "title":"Panel 1",
            "content": [
                {
                    "id":"name",
                    "placeholder":"Veillez entrez votre nom",
                    "label":"Votre Nom",
                    "inputClass":"col-md-12",
                    "name":"name",
                    "value":"",
                    "type":"text",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "panel-2": {
            "title":"Panel 2",
            "content": [
                {
                    "id":"name",
                    "placeholder":"Veillez entrez votre nom",
                    "label":"Votre Nom",
                    "inputClass":"col-md-12",
                    "name":"name",
                    "value":"",
                    "type":"text",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "panel-3":{
            "title":"Panel 3",
            "content": [
                {
                    "id":"name",
                    "placeholder":"Veillez entrez votre nom",
                    "label":"Votre Nom",
                    "inputClass":"col-md-12",
                    "name":"name",
                    "value":"",
                    "type":"text",
                    "required":true,
                    "maxLength":"",
                    "minLength":"",
                    "regExp":""
                }
            ]
        },
        "action": {
            "title":"Envoyer",
            "endpoint":"/agent/create"
        }
    }
};
