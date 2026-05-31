document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileNav.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close mobile nav when clicking a link
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section[id], header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id') || '';
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- Scroll Triggered Fade-In Animations ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // --- Gallery Tag Filtering ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from buttons and add to clicked
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryCards.forEach(card => {
                const cardTags = card.getAttribute('data-tags').split(' ');
                
                if (filterValue === 'all' || cardTags.includes(filterValue)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // --- E-commerce Shopping Cart Management ---
    let cart = [];
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartContainer = document.getElementById('cart-items-container');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotalVal = document.getElementById('cart-subtotal');
    const cartTotalVal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    // Add to cart click event
    const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'), 10);
            const img = btn.getAttribute('data-img');

            // Add or increment item
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, img, quantity: 1 });
            }

            // Custom Analytics Event
            if (typeof gtag === 'function') {
                gtag('event', 'add_to_cart', {
                    currency: 'JPY',
                    value: price,
                    items: [{ item_id: id, item_name: name, price: price, quantity: 1 }]
                });
            }
            if (typeof fbq === 'function') {
                fbq('track', 'AddToCart', { content_ids: [id], content_type: 'product', value: price, currency: 'JPY' });
            }

            // UI updates
            showDxToast(`「${name}」をカートに追加しました。`);
            updateCartUI();
            openCartDrawer();
        });
    });

    // Toggle Cart Drawer
    function openCartDrawer() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    }

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // Update Cart HTML & totals
    function updateCartUI() {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="cart-empty-message">カートは空です。</div>';
            cartFooter.style.display = 'none';
            return;
        }

        cartFooter.style.display = 'block';
        cartContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-img-wrapper">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                </div>
                <div class="cart-item-details">
                    <div>
                        <h4 class="cart-item-title">${item.name}</h4>
                        <span class="cart-item-price">¥${item.price.toLocaleString()}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-qty-editor">
                            <button class="cart-qty-btn decrease-qty" data-id="${item.id}">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
                        </div>
                        <button class="cart-item-delete" data-id="${item.id}">削除</button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(itemEl);
        });

        // Set totals
        cartSubtotalVal.textContent = `¥${subtotal.toLocaleString()}`;
        cartTotalVal.textContent = `¥${subtotal.toLocaleString()}`;

        // Re-attach drawer action event listeners
        attachCartActionListeners();
    }

    function attachCartActionListeners() {
        // Decrease Qty
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                    } else {
                        cart = cart.filter(i => i.id !== id);
                    }
                    updateCartUI();
                }
            });
        });

        // Increase Qty
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity += 1;
                    updateCartUI();
                }
            });
        });

        // Delete Item
        document.querySelectorAll('.cart-item-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(i => i.id !== id);
                updateCartUI();
            });
        });
    }

    // Checkout Flow Simulation
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = '決済処理中...';

            // GA4 Begin Checkout Event
            if (typeof gtag === 'function') {
                gtag('event', 'begin_checkout', {
                    currency: 'JPY',
                    value: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
                    items: cart.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
                });
            }
            if (typeof fbq === 'function') {
                fbq('track', 'InitiateCheckout');
            }

            setTimeout(() => {
                showDxToast('【デモ機能】決済が完了しました。本番環境ではStripe等の決済ゲートウェイに遷移します。');
                cart = [];
                updateCartUI();
                closeCartDrawer();
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'レジに進む（デモ決済）';
            }, 1500);
        });
    }

    // --- LINE & Square DX Buttons Event Handlers ---
    const lineBtn = document.getElementById('line-reserve-btn');
    const squareBtn = document.getElementById('square-reserve-btn');
    const headerCta = document.querySelector('.header-cta');
    const mobileCta = document.querySelector('.mobile-nav-list .btn-primary');

    const handleBookingClick = (type) => {
        if (typeof gtag === 'function') {
            gtag('event', `click_${type}_reserve`, {
                event_category: 'DX_Booking',
                event_label: `Reserve_Via_${type}`
            });
        }
        if (typeof fbq === 'function') {
            fbq('track', 'Contact', { method: type });
        }
        showDxToast(`【デモ機能】本番環境では、ここから店舗の${type === 'line' ? 'LINE公式アカウント（友だち追加・予約画面）' : 'Square Appointmentsオンライン予約画面'}へ直接遷移します。`);
    };

    if (lineBtn) {
        lineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleBookingClick('line');
        });
    }

    if (squareBtn) {
        squareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleBookingClick('square');
        });
    }

    [headerCta, mobileCta].forEach(cta => {
        if (cta) {
            cta.addEventListener('click', (e) => {
                e.preventDefault();
                handleBookingClick('header_quick');
            });
        }
    });

    // --- DX Toast Notification ---
    function showDxToast(msg) {
        const existingToast = document.querySelector('.dx-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'dx-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }

    // --- AI Concierge Chatbot logic ---
    const aiTrigger = document.getElementById('ai-concierge-trigger');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiChatClose = document.getElementById('ai-chat-close');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatBody = document.getElementById('ai-chat-body');

    if (aiTrigger && aiChatWindow) {
        aiTrigger.addEventListener('click', () => {
            if (aiChatWindow.style.display === 'none') {
                aiChatWindow.style.display = 'flex';
                setTimeout(() => aiChatInput.focus(), 100);
            } else {
                aiChatWindow.style.display = 'none';
            }
        });
    }

    if (aiChatClose) {
        aiChatClose.addEventListener('click', () => {
            aiChatWindow.style.display = 'none';
        });
    }

    function sendAiMessage() {
        const query = aiChatInput.value.trim();
        if (!query) return;

        // Append User Bubble
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-message ai-message-user';
        userMsg.textContent = query;
        aiChatBody.appendChild(userMsg);

        aiChatInput.value = '';
        aiChatBody.scrollTop = aiChatBody.scrollHeight;

        // Loading state
        const loadingId = 'ai-loading-' + Date.now();
        const loading = document.createElement('div');
        loading.className = 'ai-loading';
        loading.id = loadingId;
        loading.textContent = 'AIがヘアサロン情報を確認中...';
        aiChatBody.appendChild(loading);
        aiChatBody.scrollTop = aiChatBody.scrollHeight;

        // Auto Bot Answer Delay
        setTimeout(() => {
            const currentLoading = document.getElementById(loadingId);
            if (currentLoading) currentLoading.remove();

            let reply = "ご質問ありがとうございます！詳細については店舗（03-1234-5678）へ直接お電話いただくか、LINE公式アカウントのメッセージよりスタッフへお気軽にお問い合わせください。✨";

            if (query.match(/予約|空き|枠/i)) {
                reply = "ご予約は、右側（スマホは最下部）にある『WEB予約』または『LINEスマート予約』ボタンより、Square予約システムを介してリアルタイムに空き枠をご確認いただけます。24時間受付しております。";
            } else if (query.match(/骨格|カット|似合う|顔/i)) {
                reply = "LUSTER新宿自慢の【骨格診断カット（¥9,800）】は、お客様一人ひとりの骨格・パーツ配置を診断し、コンプレックスを解消する似合わせカットです。トップスタイリストの田中美咲が得意としております。";
            } else if (query.match(/髪質|改善|トリートメント|ダメージ|パサ/i)) {
                reply = "当店の【髪質改善プログラム（¥6,500〜）】は、うねりやくせ毛の内部構造をオーガニック補修し、うる艶の仕上がりに導く大人気ケアメニューです。スタイリストの鈴木彩花が精通しております。";
            } else if (query.match(/アクセス|場所|駅|住所/i)) {
                reply = "当店はJR新宿駅東口より徒歩3分、地下鉄新宿三丁目駅 B1出口より徒歩1分の新宿ビル 5Fにございます。植物に囲まれた看板のない大人の隠れ家空間です。";
            } else if (query.match(/料金|メニュー|価格/i)) {
                reply = "カットは¥7,500、骨格診断カットは¥9,800、カラーは¥8,500〜、髪質改善トリートメントは¥6,500からご案内しております。詳細プランはメニュー一覧（#menu）をご参照ください。";
            } else if (query.match(/オイル|シャンプー|商品|ヘアケア/i)) {
                reply = "当店のおすすめホームケア製品『オーガニック ヘアオイル（¥4,800）』および『プレミアム シャンプー（¥3,500）』は、Shopセクションの『購入する』ボタンよりカートへ追加し、オンラインデモ購入が可能です。";
            }

            // Append Bot Bubble
            const botMsg = document.createElement('div');
            botMsg.className = 'ai-message ai-message-bot';
            botMsg.textContent = reply;
            aiChatBody.appendChild(botMsg);
            aiChatBody.scrollTop = aiChatBody.scrollHeight;
        }, 1200);
    }

    if (aiChatSend) {
        aiChatSend.addEventListener('click', sendAiMessage);
    }

    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAiMessage();
            }
        });
    }
});
