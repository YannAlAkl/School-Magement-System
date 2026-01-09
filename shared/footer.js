import View from '#core/view';
class SharedFooterView extends View {
    
    static template =() => View.html`
    <footer>
        <p>&copy; 2026 School Management System. All rights reserved.</p>
    </footer>
    `;   
     
    
    constructor() {
        super(SharedFooterView.template);
    }
    
}
 

export default SharedFooterView;
