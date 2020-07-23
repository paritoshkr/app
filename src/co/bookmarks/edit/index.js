import s from './index.module.styl'
import React from 'react'
import t from '~t'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as bookmarksActions from '~data/actions/bookmarks'
import { makeDraftItem, makeDraftStatus, makeDraftUnsaved } from '~data/selectors/bookmarks'

import { Alert } from '~co/overlay/dialog'
import Form from './form'
import Error from './error'

class EditBookmarkContainer extends React.Component {
	static defaultProps = {
		_id: 0
	}

	componentDidMount() {
		this.handlers.onLoad()

		window.addEventListener('beforeunload', this.onWindowClose)
	}

	async componentWillUnmount() {
		await this.handlers.onSubmit()
		
		window.removeEventListener('beforeunload', this.onWindowClose)
	}

	componentDidUpdate(prev) {
		const { _id, status, item } = this.props

		if (status != prev.status || item.type != prev.item.type) {
			if (status == 'errorSaving')
				Alert(t.s('saveError'), { variant: 'error' })
        }
        
        if (_id != prev._id){
			//save unsaved changes if user try to open another bookmark
			if (prev.unsaved)
				prev.actions.bookmarks.draftCommit(prev._id)

			this.handlers.onLoad()
		}
	}

	onWindowClose = (e)=>{
		if (this.props.unsaved){
			this.handlers.onSubmit()
			
			e.preventDefault()
			e.returnValue = ''
		}
	}

	handlers = {
        onLoad: ()=>
            this.props.actions.bookmarks.draftLoad(this.props._id),

        onChange: (obj)=>
            this.props.actions.bookmarks.draftChange(this.props.item._id, obj),
    
        onSubmit: ()=>{
            return new Promise((res,rej)=>{
                this.props.actions.bookmarks.draftCommit(this.props.item._id, res, rej)
            })
        },
    
        onRecover: ()=>
            this.props.actions.bookmarks.oneRecover(this.props.item._id)
    }

	render() {
		let content

		switch(this.props.status){
			case 'error':
				content = <Error />;
				break

			default:
				content = <Form {...this.props} {...this.handlers} />;
				break
		}

		return (
			<div className={s.edit}>
				{content}
			</div>
		)
	}
}

const makeMapStateToProps = () => {
	const 
		getDraftItem = makeDraftItem(),
		getDraftStatus = makeDraftStatus(),
		getDraftUnsaved = makeDraftUnsaved()

	return (state, props)=>({
		status: getDraftStatus(state, props),
		item: getDraftItem(state, props),
		unsaved: getDraftUnsaved(state, props)
	})
}

export default connect(
	makeMapStateToProps,
	(dispatch)=>({
		actions: {
			bookmarks: bindActionCreators(bookmarksActions, dispatch)
		}
	})
)(EditBookmarkContainer)