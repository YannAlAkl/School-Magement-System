// School  management system
import View from '#core/view';

class SharedFooterView extends View {
    static template =() => View.html`
    <footer>
         <p>© 2023 School Magement System</p>
    </footer>
    `;   
     
    constructor() {
        super(SharedFooterView.template);
    }
    
}
 
export default SharedFooterView;

        
    


