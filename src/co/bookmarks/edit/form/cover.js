import styles from './cover.module.styl'
import React from 'react'
import t from '~t'
import { captureTab } from '~target'

import Cover from '~co/bookmarks/item/cover'
import Icon from '~co/common/icon'
import ImagePicker from '~co/picker/image'

export default class BookmarkEditFormCover extends React.Component {
    state = {
        modal: false
    }

    onModalOpen = (e)=>{
        e.preventDefault()
        this.setState({ modal: true })
    }

    handlers = {
        onClose: ()=>
            this.setState({ modal: false }),

        onLink: async(link)=>{
            let media = [...this.props.item.media]

            if (!media.some(item=>item.link == link))
                media = [ ...media, { link } ]

            this.props.onChange({
                cover: link,
                media
            })

            this.props.onSave()
        },

        onScreenshot: async()=>{
            const screenshot = await captureTab(this.props.item.link)

            if (typeof screenshot == 'string')
                await this.handlers.onLink('<screenshot>')
            else
                await this.handlers.onFile(screenshot)
        },

        onFile: async(file)=>{
            return this.props.onUploadCover(file)
        }
    }

    render() {
        const { item: { cover, link, media } } = this.props

        return (
            <div className={styles.wrap}>
                <a 
                    href=''
                    className={styles.cover}
                    title={t.s('changeIcon')}
                    onClick={this.onModalOpen}>
                    <Cover 
                        indicator={true}
                        cover={cover}
                        link={link}
                        view='list' />

                    <span className={styles.more}>
                        <Icon name='arrow' />
                    </span>
                </a>

                {this.state.modal && (
                    <ImagePicker
                        items={media}
                        selected={cover}
                        {...this.handlers} />
                )}
            </div>
        )
    }
}