/**
 * Tiptap Editor Module
 * 사용법: TiptapEditor.init('elementId', options)
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Mention from '@tiptap/extension-mention';

// SVG 아이콘 정의
const Icons = {
    bold: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',
    italic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
    strikethrough: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><path d="M17.5 7.5c-1.5-1.5-3.5-2-5.5-2s-4 .5-5.5 2c-1 1-1.5 2.5-1.5 4s.5 3 1.5 4c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2"></path></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    bulletList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="4" cy="6" r="1.5" fill="currentColor"></circle><circle cx="4" cy="12" r="1.5" fill="currentColor"></circle><circle cx="4" cy="18" r="1.5" fill="currentColor"></circle></svg>',
    orderedList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><text x="4" y="7" font-size="6" fill="currentColor" stroke="none" font-weight="bold">1</text><text x="4" y="13" font-size="6" fill="currentColor" stroke="none" font-weight="bold">2</text><text x="4" y="19" font-size="6" fill="currentColor" stroke="none" font-weight="bold">3</text></svg>',
    taskList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"></rect><path d="M5 11l1.5 1.5L9 8"></path><line x1="13" y1="8" x2="21" y2="8"></line><rect x="3" y="13" width="6" height="6" rx="1"></rect><line x1="13" y1="16" x2="21" y2="16"></line></svg>',
    quote: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"></path></svg>',
    codeBlock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 10l-2 2 2 2"></path><path d="M16 10l2 2-2 2"></path><line x1="12" y1="8" x2="12" y2="16"></line></svg>',
    horizontalRule: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
    table: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
    image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>',
    undo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"></path><path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-2.12 0-4.07-.74-5.61-1.97"></path></svg>',
    redo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"></path><path d="M21 13c0-4.97-4.03-9-9-9S3 8.03 3 13s4.03 9 9 9c2.12 0 4.07-.74 5.61-1.97"></path></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    paragraph: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path></svg>'
};

class TiptapEditor {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        if (!this.container) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        
        this.options = {
            placeholder: options.placeholder || '내용을 입력하세요... "/" 명령어, "@" 멘션',
            content: options.content || '',
            users: options.users || [
                { id: '1', name: '김철수', role: '개발팀' },
                { id: '2', name: '이영희', role: '디자인팀' },
                { id: '3', name: '박지민', role: '기획팀' },
                { id: '4', name: '최수진', role: '마케팅팀' },
                { id: '5', name: '정민호', role: '경영지원팀' }
            ],
            onChange: options.onChange || null,
            ...options
        };
        
        this.editor = null;
        this.slashVisible = false;
        this.slashIdx = 0;
        this.slashStart = null;
        this.filteredCommands = [];
        
        this.slashCommands = [
            { cmd: 'paragraph', title: '본문', desc: '일반 텍스트', icon: '📝' },
            { cmd: 'heading1', title: '제목 1', desc: '큰 제목', icon: 'H1' },
            { cmd: 'heading2', title: '제목 2', desc: '중간 제목', icon: 'H2' },
            { cmd: 'heading3', title: '제목 3', desc: '작은 제목', icon: 'H3' },
            { cmd: 'bulletList', title: '글머리 기호', desc: '순서 없는 목록', icon: '•' },
            { cmd: 'orderedList', title: '번호 목록', desc: '순서 있는 목록', icon: '1.' },
            { cmd: 'taskList', title: '체크리스트', desc: '할 일 목록', icon: '☑' },
            { cmd: 'table', title: '테이블', desc: '테이블 삽입', icon: '📊' },
            { cmd: 'blockquote', title: '인용', desc: '인용 블록', icon: '"' },
            { cmd: 'codeBlock', title: '코드 블록', desc: '코드 작성', icon: '{ }' },
            { cmd: 'horizontalRule', title: '구분선', desc: '수평선', icon: '—' },
            { cmd: 'image', title: '이미지', desc: '이미지 업로드', icon: '🖼️' }
        ];
        
        this.init();
    }
    
    generateId(base) {
        return `${base}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    init() {
        this.ids = {
            toolbar: this.generateId('toolbar'),
            editorArea: this.generateId('editorArea'),
            bold: this.generateId('bold'),
            italic: this.generateId('italic'),
            strike: this.generateId('strike'),
            code: this.generateId('code'),
            heading1: this.generateId('heading1'),
            heading2: this.generateId('heading2'),
            heading3: this.generateId('heading3'),
            paragraph: this.generateId('paragraph'),
            bullet: this.generateId('bullet'),
            ordered: this.generateId('ordered'),
            task: this.generateId('task'),
            quote: this.generateId('quote'),
            codeblock: this.generateId('codeblock'),
            hr: this.generateId('hr'),
            table: this.generateId('table'),
            image: this.generateId('image'),
            undo: this.generateId('undo'),
            redo: this.generateId('redo'),
            imageInput: this.generateId('imageInput'),
            slashMenu: this.generateId('slashMenu'),
            mentionMenu: this.generateId('mentionMenu'),
            tableMenu: this.generateId('tableMenu'),
            tableGrid: this.generateId('tableGrid'),
            linkPopup: this.generateId('linkPopup'),
            linkInput: this.generateId('linkInput'),
            linkApply: this.generateId('linkApply'),
            colorPicker: this.generateId('colorPicker'),
            link: this.generateId('link')
        };
        
        this.render();
        this.createEditor();
        this.bindEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="tiptap-container">
                <div class="tiptap-toolbar" id="${this.ids.toolbar}">
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.bold}" title="굵게 (Ctrl+B)">${Icons.bold}</button>
                        <button id="${this.ids.italic}" title="기울임 (Ctrl+I)">${Icons.italic}</button>
                        <button id="${this.ids.strike}" title="취소선">${Icons.strikethrough}</button>
                        <button id="${this.ids.code}" title="인라인 코드">${Icons.code}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.heading1}" class="heading-btn" title="제목 1">H1</button>
                        <button id="${this.ids.heading2}" class="heading-btn" title="제목 2">H2</button>
                        <button id="${this.ids.heading3}" class="heading-btn" title="제목 3">H3</button>
                        <button id="${this.ids.paragraph}" title="본문">${Icons.paragraph}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.bullet}" title="글머리 기호">${Icons.bulletList}</button>
                        <button id="${this.ids.ordered}" title="번호 목록">${Icons.orderedList}</button>
                        <button id="${this.ids.task}" title="체크리스트">${Icons.taskList}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.quote}" title="인용">${Icons.quote}</button>
                        <button id="${this.ids.codeblock}" title="코드 블록">${Icons.codeBlock}</button>
                        <button id="${this.ids.hr}" title="구분선">${Icons.horizontalRule}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.table}" title="테이블">${Icons.table}</button>
                        <button id="${this.ids.image}" title="이미지">${Icons.image}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.link}" title="링크 (Ctrl+K)">${Icons.link}</button>
                    </div>
                    <div class="tiptap-toolbar-group">
                        <button id="${this.ids.undo}" title="실행취소 (Ctrl+Z)">${Icons.undo}</button>
                        <button id="${this.ids.redo}" title="다시실행 (Ctrl+Y)">${Icons.redo}</button>
                    </div>
                </div>
                <div class="tiptap-editor-area" id="${this.ids.editorArea}"></div>
                <div class="tiptap-help">
                    <kbd>/</kbd> 슬래시 명령 | <kbd>@</kbd> 멘션 | <kbd>Ctrl+B</kbd> 굵게 | 테이블 셀 우클릭으로 행/열 추가
                </div>
            </div>
            <input type="file" id="${this.ids.imageInput}" accept="image/*" style="display:none">
        `;
        
        this.createPopups();
    }
    
    createPopups() {
        // 테이블 그리드 생성 (8x6)
        let gridCells = '';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 8; col++) {
                gridCells += `<div class="tiptap-table-grid-cell" data-row="${row + 1}" data-col="${col + 1}"></div>`;
            }
        }
        
        const popupsHtml = `
            <div class="tiptap-popup tiptap-slash-menu" id="${this.ids.slashMenu}"></div>
            <div class="tiptap-popup tiptap-mention-menu" id="${this.ids.mentionMenu}"></div>
            <div class="tiptap-popup tiptap-table-menu" id="${this.ids.tableMenu}">
                <div class="tiptap-popup-item" data-action="addColumnBefore">⬅️ 왼쪽에 열 추가</div>
                <div class="tiptap-popup-item" data-action="addColumnAfter">➡️ 오른쪽에 열 추가</div>
                <div class="tiptap-popup-item" data-action="addRowBefore">⬆️ 위에 행 추가</div>
                <div class="tiptap-popup-item" data-action="addRowAfter">⬇️ 아래에 행 추가</div>
                <div class="tiptap-menu-divider"></div>
                <div class="tiptap-popup-item" data-action="deleteColumn">🗑️ 열 삭제</div>
                <div class="tiptap-popup-item" data-action="deleteRow">🗑️ 행 삭제</div>
                <div class="tiptap-menu-divider"></div>
                <div class="tiptap-popup-item danger" data-action="deleteTable">❌ 테이블 삭제</div>
            </div>
            <div class="tiptap-popup tiptap-table-grid" id="${this.ids.tableGrid}">
                <div class="tiptap-table-grid-container">
                    ${gridCells}
                </div>
                <div class="tiptap-table-grid-size">테이블 선택</div>
            </div>
            <div class="tiptap-popup tiptap-link-popup" id="${this.ids.linkPopup}">
                <input type="url" id="${this.ids.linkInput}" placeholder="https://example.com">
                <button id="${this.ids.linkApply}">적용</button>
            </div>
            <div class="tiptap-popup tiptap-color-picker" id="${this.ids.colorPicker}">
                <div class="tiptap-color-grid">
                    <button class="tiptap-color-btn" style="background:#000" data-color="#000"></button>
                    <button class="tiptap-color-btn" style="background:#666" data-color="#666"></button>
                    <button class="tiptap-color-btn" style="background:#999" data-color="#999"></button>
                    <button class="tiptap-color-btn" style="background:#ef4444" data-color="#ef4444"></button>
                    <button class="tiptap-color-btn" style="background:#f97316" data-color="#f97316"></button>
                    <button class="tiptap-color-btn" style="background:#eab308" data-color="#eab308"></button>
                    <button class="tiptap-color-btn" style="background:#22c55e" data-color="#22c55e"></button>
                    <button class="tiptap-color-btn" style="background:#3b82f6" data-color="#3b82f6"></button>
                    <button class="tiptap-color-btn" style="background:#8b5cf6" data-color="#8b5cf6"></button>
                    <button class="tiptap-color-btn" style="background:#ec4899" data-color="#ec4899"></button>
                </div>
            </div>
        `;
        
        const popupContainer = document.createElement('div');
        popupContainer.innerHTML = popupsHtml;
        while (popupContainer.firstChild) {
            document.body.appendChild(popupContainer.firstChild);
        }
    }
    
    $(id) {
        return document.getElementById(id);
    }
    
    showPopup(el, x, y) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.classList.add('show');
    }
    
    hidePopup(el) {
		try{
			el.classList.remove('show');
		}catch(e){}
        
    }
    
    createEditor() {
        const self = this;
        
		/*
        this.editor = new Editor({
            element: this.$(this.ids.editorArea),
            extensions: [
                StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
                Table.configure({ resizable: true }),
                TableRow,
                TableCell,
                TableHeader,
                Underline,
                Highlight.configure({ multicolor: true }),
                Link.configure({ openOnClick: false }),
                Image.configure({ allowBase64: true }),
                Placeholder.configure({ placeholder: this.options.placeholder }),
                TaskList,
                TaskItem.configure({ nested: true }),
                TextStyle,
                Color,
				
                Mention.configure({
                    HTMLAttributes: { class: 'mention' },
                    suggestion: {
                        char: '@',
                        items: ({ query }) => self.options.users.filter(u => u.name.includes(query)).slice(0, 5),
                        render: () => self.createMentionRenderer()
                    }
                })
            ],
			
            content: this.options.content,
            onUpdate: () => {
                this.updateToolbarState();
                this.handleSlashCommand();
                if (this.options.onChange) {
                    this.options.onChange(this.getHTML());
                }
            },
            onSelectionUpdate: () => {
                this.updateToolbarState();
            }
        });
		*/
		
		
		// 기본 extensions
		    const extensions = [
		        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
		        Table.configure({ resizable: true }),
		        TableRow,
		        TableCell,
		        TableHeader,
		        Underline,
		        Highlight.configure({ multicolor: true }),
		        Link.configure({ openOnClick: false }),
		        Image.configure({ allowBase64: true }),
		        Placeholder.configure({ placeholder: this.options.placeholder }),
		        TaskList,
		        TaskItem.configure({ nested: true }),
		        TextStyle,
		        Color
		    ];
		    
		    // users가 있을 때만 Mention 추가
		    if (this.options.users && this.options.users.length > 0) {
		        extensions.push(
		            Mention.configure({
		                HTMLAttributes: { class: 'mention' },
		                suggestion: {
		                    char: '@',
		                    items: ({ query }) => self.options.users.filter(u => u.name.includes(query)).slice(0, 5),
		                    render: () => self.createMentionRenderer()
		                }
		            })
		        );
		    }

		    this.editor = new Editor({
		        element: this.$(this.ids.editorArea),
		        extensions: extensions,
		        content: this.options.content,
		        onUpdate: () => {
		            this.updateToolbarState();
		            this.handleSlashCommand();
		            if (this.options.onChange) {
		                this.options.onChange(this.getHTML());
		            }
		        },
		        onSelectionUpdate: () => {
		            this.updateToolbarState();
		        }
		    });
    }
    
    createMentionRenderer() {
        const self = this;
        let selectedIndex = 0;
        let currentItems = [];
        let commandFn = null;
        
        const updateMenu = (rect) => {
            const popup = self.$(self.ids.mentionMenu);
            popup.innerHTML = currentItems.map((u, i) => `
                <div class="tiptap-popup-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
                    <div class="tiptap-mention-avatar">${u.name[0]}</div>
                    <div>
                        <div class="tiptap-popup-item-title">${u.name}</div>
                        <div class="tiptap-mention-role">${u.role}</div>
                    </div>
                </div>
            `).join('');
            
            popup.querySelectorAll('.tiptap-popup-item').forEach(el => {
                el.onclick = () => {
                    const i = parseInt(el.dataset.index);
                    if (currentItems[i] && commandFn) {
                        commandFn({ id: currentItems[i].id, label: currentItems[i].name });
                    }
                };
            });
            
            if (rect) {
                self.showPopup(popup, rect.left, rect.bottom + 5);
            }
        };
        
        return {
            onStart: (props) => {
                selectedIndex = 0;
                currentItems = props.items;
                commandFn = props.command;
                updateMenu(props.clientRect?.());
                self.$(self.ids.mentionMenu).classList.add('show');
            },
            onUpdate: (props) => {
                selectedIndex = 0;
                currentItems = props.items;
                commandFn = props.command;
                updateMenu(props.clientRect?.());
            },
            onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                    self.hidePopup(self.$(self.ids.mentionMenu));
                    return true;
                }
                if (props.event.key === 'ArrowDown') {
                    selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
                    updateMenu();
                    const items = self.$(self.ids.mentionMenu).querySelectorAll('.tiptap-popup-item');
                    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                    return true;
                }
                if (props.event.key === 'ArrowUp') {
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    updateMenu();
                    const items = self.$(self.ids.mentionMenu).querySelectorAll('.tiptap-popup-item');
                    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                    return true;
                }
                if (props.event.key === 'Enter') {
                    if (currentItems[selectedIndex] && commandFn) {
                        commandFn({ id: currentItems[selectedIndex].id, label: currentItems[selectedIndex].name });
                    }
                    return true;
                }
                return false;
            },
            onExit: () => {
                self.hidePopup(self.$(self.ids.mentionMenu));
                currentItems = [];
                commandFn = null;
            }
        };
    }
    
    renderSlashMenu(filter = '') {
        const menu = this.$(this.ids.slashMenu);
        this.filteredCommands = this.slashCommands.filter(c => 
            c.title.includes(filter) || c.desc.includes(filter)
        );
        
        menu.innerHTML = this.filteredCommands.map((c, i) => `
            <div class="tiptap-popup-item ${i === this.slashIdx ? 'selected' : ''}" data-cmd="${c.cmd}" data-index="${i}">
                <div class="tiptap-popup-item-icon">${c.icon}</div>
                <div>
                    <div class="tiptap-popup-item-title">${c.title}</div>
                    <div class="tiptap-popup-item-desc">${c.desc}</div>
                </div>
            </div>
        `).join('');
        
        menu.querySelectorAll('.tiptap-popup-item').forEach(el => {
            el.onclick = () => {
                this.slashIdx = parseInt(el.dataset.index);
                this.executeSlashCommand();
            };
        });
        
        return this.filteredCommands;
    }
    
    updateSlashSelection() {
        const menu = this.$(this.ids.slashMenu);
        const items = menu.querySelectorAll('.tiptap-popup-item');
        items.forEach((el, i) => {
            el.classList.toggle('selected', i === this.slashIdx);
            if (i === this.slashIdx) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }
    
    executeSlashCommand() {
        if (!this.filteredCommands[this.slashIdx]) return;
        
        const cmd = this.filteredCommands[this.slashIdx].cmd;
        
        if (this.slashStart !== null) {
            this.editor.chain().focus().deleteRange({ 
                from: this.slashStart, 
                to: this.editor.state.selection.from 
            }).run();
        }
        
        const actions = {
            paragraph: () => this.editor.chain().focus().setParagraph().run(),
            heading1: () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
            heading2: () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
            heading3: () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
            bulletList: () => this.editor.chain().focus().toggleBulletList().run(),
            orderedList: () => this.editor.chain().focus().toggleOrderedList().run(),
            taskList: () => this.editor.chain().focus().toggleTaskList().run(),
            table: () => this.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            blockquote: () => this.editor.chain().focus().toggleBlockquote().run(),
            codeBlock: () => this.editor.chain().focus().toggleCodeBlock().run(),
            horizontalRule: () => this.editor.chain().focus().setHorizontalRule().run(),
            image: () => this.$(this.ids.imageInput).click()
        };
        
        actions[cmd]?.();
        
        this.hidePopup(this.$(this.ids.slashMenu));
        this.slashVisible = false;
        this.slashStart = null;
        this.filteredCommands = [];
    }
    
    handleSlashCommand() {
        const { from } = this.editor.state.selection;
        const text = this.editor.state.doc.textBetween(Math.max(0, from - 20), from);
        const match = text.match(/\/([^\s\/]*)$/);
        
        if (match) {
            this.slashStart = from - match[0].length;
            
            if (!this.slashVisible) {
                const coords = this.editor.view.coordsAtPos(from);
                this.showPopup(this.$(this.ids.slashMenu), coords.left, coords.bottom + 5);
                this.slashVisible = true;
                this.slashIdx = 0;
            }
            
            const filtered = this.renderSlashMenu(match[1]);
            
            if (!filtered.length) {
                this.hidePopup(this.$(this.ids.slashMenu));
                this.slashVisible = false;
                this.filteredCommands = [];
            }
        } else if (this.slashVisible) {
            this.hidePopup(this.$(this.ids.slashMenu));
            this.slashVisible = false;
            this.slashStart = null;
            this.filteredCommands = [];
        }
    }
    
    updateToolbarState() {
        const buttons = {
            [this.ids.bold]: 'bold',
            [this.ids.italic]: 'italic',
            [this.ids.strike]: 'strike',
            [this.ids.code]: 'code',
            [this.ids.bullet]: 'bulletList',
            [this.ids.ordered]: 'orderedList',
            [this.ids.task]: 'taskList',
            [this.ids.quote]: 'blockquote',
            [this.ids.codeblock]: 'codeBlock'
        };
        
        Object.entries(buttons).forEach(([id, name]) => {
            const btn = this.$(id);
            if (btn) {
                btn.classList.toggle('active', this.editor.isActive(name));
            }
        });
        
        // 헤딩 버튼 상태
        this.$(this.ids.heading1)?.classList.toggle('active', this.editor.isActive('heading', { level: 1 }));
        this.$(this.ids.heading2)?.classList.toggle('active', this.editor.isActive('heading', { level: 2 }));
        this.$(this.ids.heading3)?.classList.toggle('active', this.editor.isActive('heading', { level: 3 }));
        this.$(this.ids.paragraph)?.classList.toggle('active', this.editor.isActive('paragraph') && !this.editor.isActive('heading'));
    }
    
    bindEvents() {
        // 툴바 버튼
        this.$(this.ids.bold).onclick = () => this.editor.chain().focus().toggleBold().run();
        this.$(this.ids.italic).onclick = () => this.editor.chain().focus().toggleItalic().run();
        this.$(this.ids.strike).onclick = () => this.editor.chain().focus().toggleStrike().run();
        this.$(this.ids.code).onclick = () => this.editor.chain().focus().toggleCode().run();
        this.$(this.ids.heading1).onclick = () => this.editor.chain().focus().toggleHeading({ level: 1 }).run();
        this.$(this.ids.heading2).onclick = () => this.editor.chain().focus().toggleHeading({ level: 2 }).run();
        this.$(this.ids.heading3).onclick = () => this.editor.chain().focus().toggleHeading({ level: 3 }).run();
        this.$(this.ids.paragraph).onclick = () => this.editor.chain().focus().setParagraph().run();
        this.$(this.ids.bullet).onclick = () => this.editor.chain().focus().toggleBulletList().run();
        this.$(this.ids.ordered).onclick = () => this.editor.chain().focus().toggleOrderedList().run();
        this.$(this.ids.task).onclick = () => this.editor.chain().focus().toggleTaskList().run();
        this.$(this.ids.quote).onclick = () => this.editor.chain().focus().toggleBlockquote().run();
        this.$(this.ids.codeblock).onclick = () => this.editor.chain().focus().toggleCodeBlock().run();
        this.$(this.ids.hr).onclick = () => this.editor.chain().focus().setHorizontalRule().run();
        this.$(this.ids.undo).onclick = () => this.editor.chain().focus().undo().run();
        this.$(this.ids.redo).onclick = () => this.editor.chain().focus().redo().run();
        
        // 테이블 그리드 선택기
        this.$(this.ids.table).onclick = (e) => {
            const rect = e.target.closest('button').getBoundingClientRect();
            const gridPopup = this.$(this.ids.tableGrid);
            this.showPopup(gridPopup, rect.left, rect.bottom + 5);
        };
        
        // 테이블 그리드 셀 이벤트
        const gridContainer = this.$(this.ids.tableGrid);
        const gridCells = gridContainer.querySelectorAll('.tiptap-table-grid-cell');
        const sizeDisplay = gridContainer.querySelector('.tiptap-table-grid-size');
        
        gridCells.forEach(cell => {
            cell.addEventListener('mouseenter', () => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                gridCells.forEach(c => {
                    const cRow = parseInt(c.dataset.row);
                    const cCol = parseInt(c.dataset.col);
                    c.classList.toggle('active', cRow <= row && cCol <= col);
                });
                
                sizeDisplay.textContent = `${col} × ${row}`;
            });
            
            cell.addEventListener('click', () => {
                const rows = parseInt(cell.dataset.row);
                const cols = parseInt(cell.dataset.col);
                this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                this.hidePopup(gridContainer);
            });
        });
        
        gridContainer.addEventListener('mouseleave', () => {
            gridCells.forEach(c => c.classList.remove('active'));
            sizeDisplay.textContent = '테이블 선택';
        });
        
        // 링크
        this.$(this.ids.link).onclick = (e) => {
            const rect = e.target.closest('button').getBoundingClientRect();
            this.showPopup(this.$(this.ids.linkPopup), rect.left, rect.bottom + 5);
            this.$(this.ids.linkInput).value = this.editor.getAttributes('link').href || '';
            this.$(this.ids.linkInput).focus();
        };
        
        this.$(this.ids.linkApply).onclick = () => {
            const url = this.$(this.ids.linkInput).value;
            if (url) {
                this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            } else {
                this.editor.chain().focus().unsetLink().run();
            }
            this.hidePopup(this.$(this.ids.linkPopup));
        };
        
        this.$(this.ids.linkInput).onkeydown = (e) => {
            if (e.key === 'Enter') this.$(this.ids.linkApply).click();
            if (e.key === 'Escape') this.hidePopup(this.$(this.ids.linkPopup));
        };
        
        // 이미지
        this.$(this.ids.image).onclick = () => this.$(this.ids.imageInput).click();
        
        this.$(this.ids.imageInput).onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => this.editor.chain().focus().setImage({ src: ev.target.result }).run();
                reader.readAsDataURL(file);
            }
            e.target.value = '';
        };
        
        // 이미지 붙여넣기
        this.$(this.ids.editorArea).addEventListener('paste', (e) => {
            for (const item of e.clipboardData?.items || []) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const reader = new FileReader();
                    reader.onload = (ev) => this.editor.chain().focus().setImage({ src: ev.target.result }).run();
                    reader.readAsDataURL(item.getAsFile());
                    break;
                }
            }
        });
        
        // 테이블 컨텍스트 메뉴
        this.$(this.ids.editorArea).addEventListener('contextmenu', (e) => {
            if (e.target.closest('td, th')) {
                e.preventDefault();
                this.showPopup(this.$(this.ids.tableMenu), e.clientX, e.clientY);
            }
        });
        
        this.$(this.ids.tableMenu).querySelectorAll('.tiptap-popup-item').forEach(el => {
            el.onclick = () => {
                const actions = {
                    addColumnBefore: () => this.editor.chain().focus().addColumnBefore().run(),
                    addColumnAfter: () => this.editor.chain().focus().addColumnAfter().run(),
                    addRowBefore: () => this.editor.chain().focus().addRowBefore().run(),
                    addRowAfter: () => this.editor.chain().focus().addRowAfter().run(),
                    deleteColumn: () => this.editor.chain().focus().deleteColumn().run(),
                    deleteRow: () => this.editor.chain().focus().deleteRow().run(),
                    deleteTable: () => this.editor.chain().focus().deleteTable().run()
                };
                actions[el.dataset.action]?.();
                this.hidePopup(this.$(this.ids.tableMenu));
            };
        });
        
        // 슬래시 메뉴 키보드 이벤트
        this.$(this.ids.editorArea).addEventListener('keydown', (e) => {
            if (this.slashVisible) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.slashIdx = Math.min(this.slashIdx + 1, this.filteredCommands.length - 1);
                    this.updateSlashSelection();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.slashIdx = Math.max(this.slashIdx - 1, 0);
                    this.updateSlashSelection();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeSlashCommand();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.hidePopup(this.$(this.ids.slashMenu));
                    this.slashVisible = false;
                    this.slashStart = null;
                    this.filteredCommands = [];
                }
            }
        }, true);
        
        // 전역 클릭으로 팝업 닫기
        document.addEventListener('click', (e) => {
            const popupIds = [this.ids.slashMenu, this.ids.mentionMenu, this.ids.tableMenu, this.ids.tableGrid, this.ids.linkPopup, this.ids.colorPicker];
            
            if (!e.target.closest('.tiptap-popup') && !e.target.closest('.tiptap-toolbar')) {
                popupIds.forEach(id => this.hidePopup(this.$(id)));
            }
        });
        
        // 단축키
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.$(this.ids.link).click();
            }
        });
    }
    
    getHTML() {
        return this.editor.getHTML();
    }
    
    getJSON() {
        return this.editor.getJSON();
    }
    
    getText() {
        return this.editor.getText();
    }
    
    setContent(content) {
        this.editor.commands.setContent(content);
    }
    
    clearContent() {
        this.editor.commands.clearContent();
    }
    
    focus() {
        this.editor.commands.focus();
    }
    
    destroy() {
        [this.ids.slashMenu, this.ids.mentionMenu, this.ids.tableMenu, this.ids.tableGrid, this.ids.linkPopup, this.ids.colorPicker].forEach(id => {
            const el = this.$(id);
            if (el) el.remove();
        });
        
        if (this.editor) {
            this.editor.destroy();
        }
        
        this.container.innerHTML = '';
    }
}

export default TiptapEditor;
window.TiptapEditor = TiptapEditor;
