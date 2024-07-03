SatisClient was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

# React i18next
Pour plus d'informations voir:

https://react.i18next.com/

https://www.i18next.com/

## How to use

Si vous voulez utiliser des textes dans vos composants vous devrez utiliser
react-i18next.

### Import

Si c'est un composant react, vous devez importer `useTranslation` de `react-i18next`
puis l'appeler dans le composant
```jsx
import {useTranslation} from "react-i18next";

const YourComponent = props => {

    //usage of useTranslation i18n here
    const {t, ready} = useTranslation()

    return (<>JSX CODE</>)  
}
```
Si vous voulez juste déclarer une constante qui implique
que vous y mettiez du texte, vous ne pouvez pas utiliser
`useTranslation` qui ne marche que dans les composant react.
Dans ce cas vous devrez importer le fichier `src/i18n.js`
```js
import i18n from "./i18n";

export const yourConstant = () => {
    return ("your constant")
}
```

### Translate text
Pour les composants react il suffit d'entourer le texte avec la fonction
`t` précedemment appeler avec `const {t, ready} = useTranslation()`
 ```jsx
 import {useTranslation} from "react-i18next";
 
 const YourComponent = props => {
 
     //usage of useTranslation i18n here
     const {t, ready} = useTranslation()
 
     return (
         <>
            {t("Your text")}
         </>
     );
 }
 ```
Néanmoins il existe une variable `ready` qui est égale a `false` tant que les fichiers
de translation n'auront pas fini de chargé. Il faut l'utiliser sinon votre page
tenterai d'afficher des translations alors qu'elles n'ont pas finis de chargé
qui peut engendrer des problèmes.
 ```jsx
 import {useTranslation} from "react-i18next";
 
 const YourComponent = props => {
 
     //usage of useTranslation i18n here
     const {t, ready} = useTranslation()
 
     return (
            ready === true ? (
                    <>
                        {t("Your text")}
                    </>
            ) : null
            //null peut être remplacé par un loader ou autres  
     );
 }
 ```
Pour les constantes vu qu'on ne peut pas utiliser `useTranslation` qui ne peut être
utilisés que dans des composants react, vous allez utiliser `i18n.t` et `i18n.isInitialized` (joue le même rôle que `ready`).
Mais pour que la translation fonctionne correctement vous devez creé une fonction
qui va retourner votre constante, cette fonction sera utilisée plus tard là
ou voulez faire appel à la constante
 ```js
 import i18n from "./i18n";
 
 export const yourConstant = () => {
     return (
            i18n.isInitialized === true ? (
                i18n.t("your constant")
            ) : null
            //null peut être remplacé par un loader ou autres  
     );
 }
 ```

### Add text in translation files
Après avoir utiliser les différentes fonction propes à `react-i18next` et `i18next`
sur vos textes vous allez devoir ajouter les textes et leur translation dans les fichiers
suivants:

`public/locales/fr/translation.json` pour le français
```
    {
      ...
      "your text": "your translation" //vous pouvez écrire le même texte
      ...
    }      
```

`public/locales/en/translation.json` pour l'anglais
```
    {
      ...
      "your text": "your translation"
      ...
    }      
```# satis-pro-bis-client
