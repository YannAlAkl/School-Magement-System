import View from '#core/view';
class SharedFooterView extends View {
    
    static template =() => View.html`
    <footer>
         <p>© 2023 School Magement System</p> <!-- Avis de copyright pour le système de gestion scolaire. -->
    </footer>
    `;   
     
    
    constructor() {
        super(SharedFooterView.template);
    }
    
}
 

export default SharedFooterView;
