(function(){


    const originalReplace = history.replaceState;
    const stockAlert = document.querySelector('.stock-alert');
    const buyItNuowButton = document.querySelector('.overlay-quaternary');
    let validInventoryQuantity = null;
    let iCurrentDlg = null;
    let iClickBtn = 0;
    stockAlert.addEventListener('click', function() {
        if(iClickBtn > 0) {
            iClickBtn = 0;
            return;
        }
        if(iCurrentDlg === 1) {
            closeNotifyDlg();
        } else if(iCurrentDlg === 2) {
            closeNotifyResultDlg();
        }
    });
    if(stockAlert) {
        validInventoryQuantity = parseInt(stockAlert.dataset.stockCriteria);
    }
    history.replaceState = function(data,url) {
        originalReplace.apply(this, arguments);
        const i = location.href.indexOf('variant=');
        if(i != -1)
        {
            const variantId = location.href.substring(i + 8);
            const variant = document.querySelector(`[value="${variantId}"][data-inventory-quantity]`);
            const variantInventoryQuantity = variant.dataset.inventoryQuantity;
            variantInventoryQuantityValidTest(parseInt(variantInventoryQuantity));
        } else {
            variantInventoryQuantityValidTest(getProductInventtoryQuantity());
        }
    };
    
    
    // const addEventListenerForSwatches = () => {
    //     const variantSelectors = document.querySelectorAll("[data-inventory-quantity]");
    //     if(variantSelectors?.length) {
    //         for (const selector of variantSelectors) {
    //             selector.addEventListener('change', variantSelectHandler)
    //         }
    //         if(variantInventoryQuantity === null) {
    //             let selectedVariant;
    //             for(const variant of variantSelectors){
    //                 if(variant.checked)
    //                     selectedVariant = variant;
    //             }
    //             variantInventoryQuantity = parseInt(selectedVariant.dataset.inventoryQuantity);
    //         }
    //         // variantInventoryQuantityValidTest();
    //     }
    // }
    const getProductInventtoryQuantity = () => {
        const productInventoryQuantityElement = document.querySelector("[data-inventory-quantity]");
        if(productInventoryQuantityElement) {
            const quantity = parseInt(productInventoryQuantityElement.dataset.inventoryQuantity);
            return quantity === NaN ? null: quantity;
        }
        return null;
    }
    const getVariantInventoryQuantity = () => {
        const variantSelectors = document.querySelectorAll("[data-inventory-quantity]");
        if(variantSelectors?.length) {
            for(const variant of variantSelectors) {
                if(variant.checked) {
                    return parseInt(variant.dataset.inventoryQuantity);
                }
            }
        }
        return null;
    }
    const variantInventoryQuantityValidTest = (variantInventoryQuantity) => {
        if(variantInventoryQuantity === null){
            return;
        }
        const addToCartButtonContainer = document.querySelector('.f8pr-button');
        const btnAddToCart = addToCartButtonContainer.querySelector('button');
        if(validInventoryQuantity && variantInventoryQuantity < validInventoryQuantity){
            
            if(addToCartButtonContainer){
                const btnNotifyMe = addToCartButtonContainer.querySelector('.notify');
                if(!btnNotifyMe) {
                    const btnNewNotifyMe = document.createElement('button');
                    btnNewNotifyMe.className = 'overlay-tertiary notify';
                    btnNewNotifyMe.innerHTML = 'Notify me';
                    btnAddToCart.setAttribute('style','display:none');
                    btnNewNotifyMe.setAttribute('type','submit');
                    addToCartButtonContainer.appendChild(btnNewNotifyMe);
                    btnNewNotifyMe.addEventListener('click',function(e){
                        displayNotifyDlg();
                        e.preventDefault();
                        iCurrentDlg = 1;
                    });
                }
            }
            if(buyItNuowButton) {
                buyItNuowButton.classList.add('hidden_element');
            }
        } else {
            if(buyItNuowButton) {
                buyItNuowButton.classList.remove('hidden_element');
            }
        }
    }
    const closeNotifyDlg = () => {
        document.querySelector('.product-notify-me').setAttribute('style', 'display : none;');
        document.querySelector('.my-email').classList.remove('error-message');
        stockAlert.setAttribute('style','opacity: 0; pointer-events: none');
        iCurrentDlg = 0;
    }
    const closeNotifyResultDlg = () => {
        document.querySelector('.notify-me-result').setAttribute('style','display: none');
        stockAlert.setAttribute('style','opacity: 0; pointer-events: none');
        iCurrentDlg = 0;
    }
    const displayNotifyDlg = () => {
        stockAlert.setAttribute('style','opacity: 1; pointer-events: all');
        document.querySelector('.product-notify-me').setAttribute('style','display : block;');
        document.querySelector('.product-notify-me').addEventListener('click',function(){
            iClickBtn = 1;
        });
        document.querySelector(".btn-notify-me").addEventListener('click',notifyMe);
        document.querySelector('.my-email').value='';
        document.querySelector(".notify-btn-close").addEventListener('click', closeNotifyDlg);
    }
    const notifyMe = () => {
        const myEmailForNotify = document.querySelector('.my-email');
        if(myEmailForNotify) {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
            if (emailPattern.test(myEmailForNotify.value)) {
                const notifyResult = document.querySelector('.notify-me-result');
                notifyResult.setAttribute('style' , 'display: block;');
                notifyResult.addEventListener('click',function() {
                    iClickBtn = 2;
                });
                document.querySelector('.product-notify-me').setAttribute('style','display:none');
    
                document.querySelector(".notify-me-result-button").addEventListener('click', closeNotifyResultDlg);
                document.querySelector('.notify-me-result > .notify-btn-close').addEventListener('click' , closeNotifyResultDlg);
    
                myEmailForNotify.classList.remove('error-message');
                iCurrentDlg = 2;
    
            } else {
                myEmailForNotify.classList.add('error-message');
            }
        }
    }
    let currentVariantInventoryQuantity = getVariantInventoryQuantity();
    if(currentVariantInventoryQuantity === null) {
        currentVariantInventoryQuantity = getProductInventtoryQuantity();
    }
    variantInventoryQuantityValidTest(currentVariantInventoryQuantity);
})();